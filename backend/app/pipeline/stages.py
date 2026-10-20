"""Processing stages for one application: completeness -> enrichment -> scoring -> rules."""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.db import store
from app.db.models import Application
from app.db.statuses import (
    L_FAILURE,
    L_INTERRUPTED,
    L_SCORING_DOWN,
    L_SOURCE_ERROR,
    L_UNAVAILABLE,
    R_COMPLETE,
    R_INCOMPLETE,
    R_SCORED,
    R_SOURCE_ERROR,
    R_SOURCE_SILENT,
    R_SOURCES_CHECKED,
)
from app.pipeline.scoring import get_score
from app.pipeline.settings import pipeline_settings
from app.rules.engine import evaluate, load_rules

log = logging.getLogger(__name__)

REQUIRED_FIELDS = ("inn", "product", "amount_rub", "term_months")

# Documents every application of a product must carry: product -> document names.
# Empty for now; amount-based document requests are a credit rule, not a completeness check.
REQUIRED_DOCUMENTS: dict[str, tuple[str, ...]] = {}

Enrich = Callable[[str, str], Awaitable[dict[str, dict[str, Any]]]]
Score = Callable[[str, dict[str, dict[str, Any]]], Awaitable[dict[str, Any]]]
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


def _document_names(documents: list[Any] | None) -> set[str]:
    # A document is a plain name or an object with "type" or "name".
    names = set()
    for d in documents or []:
        if isinstance(d, str):
            names.add(d)
        elif isinstance(d, dict):
            names.add(str(d.get("type") or d.get("name")))
    return names


def missing_items(app: Application) -> list[str]:
    """What the applicant still has to provide; empty when the application is complete."""
    missing = [f for f in REQUIRED_FIELDS if getattr(app, f) in (None, "")]
    if not app.consent_bki:
        missing.append("consent_bki")
    if not app.consent_id:
        missing.append("consent_id")
    have = _document_names(app.documents)
    missing += [f"document:{d}" for d in REQUIRED_DOCUMENTS.get(app.product, ()) if d not in have]
    return missing


def failed_sources_label(results: dict[str, dict[str, Any]]) -> str | None:
    """Label for manual review if any source did not answer ok, else None."""
    bad = [r["status"] for r in results.values() if r["status"] != "ok"]
    if not bad:
        return None
    return L_UNAVAILABLE if "unavailable" in bad else L_SOURCE_ERROR


async def process_application(
    factory: sessionmaker[Session],
    app_id: int,
    enrich: Enrich,
    pause_s: float,
    sleep: Sleep = asyncio.sleep,
    score: Score = default_score,
    today: Callable[[], date] = date.today,
) -> None:
    """Drive an application that is already in completeness_check to its next stop.

    Every status change gets its own short transaction; none is held across pauses or HTTP calls.
    """
    try:
        await _run(factory, app_id, enrich, pause_s, sleep, score, today)
    except Exception:
        log.exception("application %s failed", app_id)
        try:
            with factory.begin() as s:
                store.change_status(s, app_id, "manual_review", L_INTERRUPTED, label=L_FAILURE)
        except Exception:
            log.exception("application %s: fallback to manual_review failed", app_id)


async def _run(
    factory: sessionmaker[Session],
    app_id: int,
    enrich: Enrich,
    pause_s: float,
    sleep: Sleep,
    score: Score,
    today: Callable[[], date],
) -> None:
    await sleep(pause_s)
    with factory.begin() as s:
        app = store.get_application(s, app_id)
        missing = missing_items(app)
        if missing:
            store.change_status(s, app_id, "needs_info", R_INCOMPLETE, {"missing": missing})
            return
        inn, consent_id = app.inn, app.consent_id
        application = {
            "product": app.product,
            "amount_rub": app.amount_rub,
            "term_months": app.term_months,
            "documents": [{"type": n} for n in sorted(_document_names(app.documents))],
        }
        store.change_status(s, app_id, "enrichment", R_COMPLETE)

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
            failed = sorted(k for k, r in results.items() if r["status"] != "ok")
            reason = R_SOURCE_ERROR if label == L_SOURCE_ERROR else R_SOURCE_SILENT
            store.change_status(s, app_id, "manual_review", reason, {"sources": failed}, label)
            return
        store.change_status(s, app_id, "scoring", R_SOURCES_CHECKED)

    await sleep(pause_s)
    answer = await score(inn, results)
    with factory.begin() as s:
        if answer["status"] != "ok":
            store.change_status(s, app_id, "manual_review", answer["message"], label=L_SCORING_DOWN)
            return
        scored = {"score": answer["score"], "class": answer["risk_class"]}
        store.change_status(s, app_id, "rules", R_SCORED, scored)

    await sleep(pause_s)
    decision = evaluate(application, results, {"risk_class": answer["risk_class"]}, RULES, today())
    recommendation = {
        **scored,
        **decision.recommendation,
        "explanation": decision.explanation,
        "payment_rub": decision.payment_rub,
        "share": decision.share,
    }
    with factory.begin() as s:
        store.save_rule_results(s, app_id, decision.results)
        store.save_recommendation(s, app_id, recommendation)
        reason = decision.client_reason or decision.explanation
        meta = {"failed": decision.failed}
        store.change_status(s, app_id, decision.outcome, reason, meta, decision.client_reason)
