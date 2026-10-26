"""Processing of one application: completeness -> sources -> scoring -> rules.

The application is in `processing` for all of it; the stages are only pauses and log lines.
"""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.models import Application, ApplicationStatus
from app.pipeline import store
from app.pipeline.scoring import get_score
from app.pipeline.settings import pipeline_settings
from app.pipeline.texts import (
    L_FAILURE,
    L_SCORING_DOWN,
    L_SOURCE_ERROR,
    L_UNAVAILABLE,
    MISSING_NAMES,
    R_INTERRUPTED,
    R_MANUAL,
    R_SOURCE_ERROR,
    R_SOURCE_SILENT,
)
from app.rules.engine import evaluate, load_rules

log = logging.getLogger(__name__)

# Documents every application of a product must carry: product code -> document types.
# Empty for now; amount-based document requests are a credit rule, not a completeness check.
REQUIRED_DOCUMENTS: dict[str, tuple[str, ...]] = {}

EnrichFn = Callable[[str, str], Awaitable[dict[str, dict[str, Any]]]]
ScoreFn = Callable[[str, dict[str, dict[str, Any]]], Awaitable[dict[str, Any]]]
Sleep = Callable[[float], Awaitable[None]]

RULES = load_rules()


async def default_score(inn: str, results: dict[str, dict[str, Any]]) -> dict[str, Any]:
    cfg = pipeline_settings
    return await get_score(
        inn,
        results=results,
        scoring_url=cfg.scoring_url,
        timeout_s=cfg.source_timeout_s,
        attempts=cfg.source_attempts,
        pause_s=cfg.retry_pause_s,
    )


def missing_items(app: Application) -> list[str]:
    """What the applicant still has to provide; empty when the application is complete."""
    missing = []
    if not app.company.inn:
        missing.append("inn")
    if not app.product:
        missing.append("product")
    if not app.amount:
        missing.append("amount")
    if not app.term_months:
        missing.append("term_months")
    if not app.consents.get("bki_request"):
        missing.append("consent_bki")
    have = {d.doc_type for d in app.documents}
    code = app.product.code if app.product else None
    missing += [f"document:{d}" for d in REQUIRED_DOCUMENTS.get(code, ()) if d not in have]
    return missing


def missing_text(missing: list[str]) -> str:
    names = [MISSING_NAMES.get(m) or f"документ {m.removeprefix('document:')}" for m in missing]
    return "Не хватает данных: " + ", ".join(names)


def failed_sources_label(results: dict[str, dict[str, Any]]) -> str | None:
    """Label for manual review if any source did not answer ok, else None."""
    bad = [r["status"] for r in results.values() if r["status"] != "ok"]
    if not bad:
        return None
    return L_UNAVAILABLE if "unavailable" in bad else L_SOURCE_ERROR


async def process_application(
    factory: sessionmaker[Session],
    app_id: int,
    enrich: EnrichFn,
    pause_s: float,
    sleep: Sleep = asyncio.sleep,
    score: ScoreFn = default_score,
    today: Callable[[], date] = date.today,
) -> None:
    """Drive an application that is in `processing` to its next stop.

    Every step gets its own short transaction; none is held across pauses or HTTP calls.
    """
    try:
        await _run(factory, app_id, enrich, pause_s, sleep, score, today)
    except Exception:
        log.exception("application %s failed", app_id)
        try:
            with factory.begin() as s:
                store.move(s, app_id, "manual_review", R_INTERRUPTED, [L_FAILURE])
        except Exception:
            log.exception("application %s: fallback to manual_review failed", app_id)


async def _run(
    factory: sessionmaker[Session],
    app_id: int,
    enrich: EnrichFn,
    pause_s: float,
    sleep: Sleep,
    score: ScoreFn,
    today: Callable[[], date],
) -> None:
    await sleep(pause_s)
    with factory.begin() as s:
        app = store.get_application(s, app_id)
        if app is None or app.status != ApplicationStatus.processing:
            return  # the client withdrew it during the pause
        missing = missing_items(app)
        if missing:
            store.move(s, app_id, "client_action", missing_text(missing))
            return
        # No separate consent id yet: the application number stands in (docs/integrations.md).
        inn, consent_id = app.company.inn, app.number
        application = {
            "product": app.product.code,
            "amount_rub": app.amount,
            "term_months": app.term_months,
            "rate": app.product.rate,
            "documents": [{"type": d.doc_type} for d in app.documents],
        }

    await sleep(pause_s)
    results = await enrich(inn, consent_id)
    with factory.begin() as s:
        for r in results.values():
            store.save_source_check(
                s,
                app_id,
                r["source"],
                r["status"],
                r.get("attempts", 1),
                r.get("latency_ms"),
                r.get("payload"),
                r.get("message"),
            )
        label = failed_sources_label(results)
        if label:
            reason = R_SOURCE_ERROR if label == L_SOURCE_ERROR else R_SOURCE_SILENT
            store.move(s, app_id, "manual_review", reason, [label])
            return

    await sleep(pause_s)
    answer = await score(inn, results)
    if answer["status"] != "ok":
        with factory.begin() as s:
            store.move(s, app_id, "manual_review", answer["message"], [L_SCORING_DOWN])
        return
    with factory.begin() as s:
        store.save_score(s, app_id, answer["score"], answer["risk_class"], answer["source"])

    await sleep(pause_s)
    decision = evaluate(application, results, {"risk_class": answer["risk_class"]}, RULES, today())
    recommendation = {
        "outcome": recommended_outcome(decision.outcome, decision.recommendation["kind"]),
        "reason": decision.explanation,
        "score": answer["score"],
        "class": answer["risk_class"],
        **decision.recommendation,
        "explanation": decision.explanation,
        "payment_rub": decision.payment_rub,
        "share": decision.share,
    }
    with factory.begin() as s:
        _finish(s, app_id, decision, recommendation, application)


def recommended_outcome(outcome: str, kind: str) -> str | None:
    """Core's DecisionOutcome for the underwriter; None lets Core guess from rules and score."""
    if outcome == "approved":
        return "approve"
    if outcome == "rejected":
        return "decline"
    return {"counter_offer": "counter", "reduce_amount": "counter", "request_data": "request"}.get(
        kind
    )


def _finish(
    s: Session, app_id: int, decision: Any, recommendation: dict, application: dict
) -> None:
    """Final status, decision row and recommendation in one transaction."""
    # The comment is shown to the client; the underwriter text stays in the recommendation.
    outcome = decision.outcome
    if outcome == "manual_review" and decision.recommendation["kind"] == "request_data":
        status = "client_action"
        reason = "Нужны документы: " + "; ".join(decision.recommendation["documents"])
    elif outcome == "manual_review":
        status = outcome
        reason = R_MANUAL
    else:
        status = outcome
        reason = decision.client_reason or decision.explanation
    if not store.move(s, app_id, status, reason):
        return
    store.save_rule_results(s, app_id, decision.results)
    store.set_recommendation(s, app_id, recommendation)
    if status == "approved":
        store.save_decision(
            s,
            app_id,
            "approve",
            amount=application["amount_rub"],
            term_months=application["term_months"],
            rate=application["rate"],
            monthly_payment=decision.payment_rub,
        )
    elif status == "rejected":
        store.save_decision(
            s, app_id, "decline", client_message=reason, decline_reason=decision.client_reason
        )
    elif status == "client_action":
        store.save_decision(
            s,
            app_id,
            "request",
            requested_documents=decision.recommendation["documents"],
            client_message=reason,
        )
