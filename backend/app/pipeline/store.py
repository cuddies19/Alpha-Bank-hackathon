"""All database access of the pipeline. The caller owns the transaction."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.models import (
    Application,
    ApplicationStatus,
    Decision,
    DecisionOutcome,
    RuleResult,
    Score,
    SourceCheck,
    SourceStatus,
)
from app.state.machine import SYSTEM_ACTOR, transition

log = logging.getLogger(__name__)

# our source status -> Core's
SOURCE_STATUSES = {
    "ok": SourceStatus.ok,
    "error": SourceStatus.fail,
    "unavailable": SourceStatus.unavailable,
}


def get_application(db: Session, app_id: int) -> Application | None:
    return db.get(Application, app_id)


def take_submitted(db: Session, limit: int) -> list[Application]:
    stmt = (
        select(Application)
        .where(Application.status == ApplicationStatus.submitted)
        .order_by(Application.id)
        .limit(limit)
        .with_for_update(skip_locked=True)
    )
    return list(db.scalars(stmt))


def stuck_ids(db: Session) -> list[int]:
    """Applications left in processing, e.g. by a crashed worker."""
    stmt = select(Application.id).where(Application.status == ApplicationStatus.processing)
    return list(db.scalars(stmt.order_by(Application.id)))


def move(
    db: Session, app_id: int, to_status: str, comment: str, labels: list[str] | None = None
) -> bool:
    """Change the status through the state machine; False if the application cannot move."""
    application = db.get(Application, app_id)
    if application is None:
        log.warning("application %s not found", app_id)
        return False
    payload = {"comment": comment, "labels": labels or []}
    try:
        transition(db, application, ApplicationStatus(to_status), SYSTEM_ACTOR, payload)
    except ApiError as e:
        if e.status_code != 409:
            raise
        log.warning("application %s: %s", app_id, e.message)
        return False
    return True


def save_source_check(
    db: Session,
    app_id: int,
    source: str,
    status: str,
    attempts: int,
    latency_ms: int | None,
    payload: dict | None,
    message: str | None,
) -> None:
    response = dict(payload or {})
    if message:
        response["message"] = message
    db.add(
        SourceCheck(
            application_id=app_id,
            source=source,
            status=SOURCE_STATUSES[status],
            response=response,
            response_time_ms=latency_ms or 0,
            attempts=attempts,
        )
    )


def save_score(db: Session, app_id: int, score: int, risk_class: str, model_version: str) -> None:
    db.add(
        Score(
            application_id=app_id,
            score=score,
            risk_class=risk_class,
            model_version=model_version,
        )
    )


def save_rule_results(db: Session, app_id: int, results: list[dict[str, Any]]) -> None:
    for r in results:
        db.add(
            RuleResult(
                application_id=app_id,
                code=r["code"],
                value="" if r["value"] is None else str(r["value"]),
                threshold="" if r["threshold"] is None else str(r["threshold"]),
                passed=r["passed"],
                comment=r.get("comment"),
            )
        )


def save_decision(db: Session, app_id: int, outcome: str, **fields: Any) -> None:
    """One decision row; fields are amount, term_months, rate, monthly_payment, ..."""
    db.add(Decision(application_id=app_id, outcome=DecisionOutcome(outcome), **fields))


def set_recommendation(db: Session, app_id: int, data: dict[str, Any]) -> None:
    db.get(Application, app_id).recommendation = data
