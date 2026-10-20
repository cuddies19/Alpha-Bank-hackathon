"""Processing stages for one application: completeness -> enrichment -> scoring -> rules."""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any

from sqlalchemy.orm import Session, sessionmaker

from app.db import store
from app.db.models import Application
from app.db.statuses import (
    L_FAILURE,
    L_INTERRUPTED,
    L_SOURCE_ERROR,
    L_UNAVAILABLE,
    R_COMPLETE,
    R_INCOMPLETE,
    R_NO_RULES,
    R_SCORED,
    R_SOURCE_ERROR,
    R_SOURCE_SILENT,
    R_SOURCES_CHECKED,
)

log = logging.getLogger(__name__)

REQUIRED_FIELDS = ("inn", "product", "amount_rub", "term_months")

# Documents every application of a product must carry: product -> document names.
# Empty for now; amount-based document requests are a credit rule, not a completeness check.
REQUIRED_DOCUMENTS: dict[str, tuple[str, ...]] = {}

Enrich = Callable[[str, str], Awaitable[dict[str, dict[str, Any]]]]
Sleep = Callable[[float], Awaitable[None]]


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
) -> None:
    """Drive an application that is already in completeness_check to its next stop.

    Every status change gets its own short transaction; none is held across pauses or HTTP calls.
    """
    try:
        await _run(factory, app_id, enrich, pause_s, sleep)
    except Exception:
        log.exception("application %s failed", app_id)
        try:
            with factory.begin() as s:
                store.change_status(s, app_id, "manual_review", L_INTERRUPTED, label=L_FAILURE)
        except Exception:
            log.exception("application %s: fallback to manual_review failed", app_id)


async def _run(
    factory: sessionmaker[Session], app_id: int, enrich: Enrich, pause_s: float, sleep: Sleep
) -> None:
    await sleep(pause_s)
    with factory.begin() as s:
        app = store.get_application(s, app_id)
        missing = missing_items(app)
        if missing:
            store.change_status(s, app_id, "needs_info", R_INCOMPLETE, {"missing": missing})
            return
        inn, consent_id = app.inn, app.consent_id
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
    with factory.begin() as s:
        # Stub: fixed score until the real model exists.
        store.save_recommendation(s, app_id, {"score": 640, "class": "B"})
        store.change_status(s, app_id, "rules", R_SCORED, {"score": 640, "class": "B"})

    await sleep(pause_s)
    with factory.begin() as s:
        # Stub: rules always send the application to a person.
        store.change_status(s, app_id, "manual_review", R_NO_RULES)
