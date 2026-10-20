"""Application storage over a SQLAlchemy Session.

Functions flush but never commit: the caller owns the transaction.
Claim pattern for the worker: one short transaction,
    with SessionLocal.begin() as s:
        for a in take_submitted(s, n):
            change_status(s, a.id, "completeness_check", ...)
then run the stages outside it. Never hold a transaction across stages or HTTP calls.
"""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Application, SourceCheck, StatusHistory
from app.db.statuses import check_transition


def create_application(
    session: Session,
    inn: str,
    product: str,
    amount_rub: int,
    term_months: int,
    consent_bki: bool = False,
    consent_id: str | None = None,
    documents: list[Any] | None = None,
) -> Application:
    app = Application(
        inn=inn,
        product=product,
        amount_rub=amount_rub,
        term_months=term_months,
        consent_bki=consent_bki,
        consent_id=consent_id,
        documents=documents or [],
    )
    session.add(app)
    session.flush()
    session.refresh(app)
    return app


def get_application(session: Session, app_id: int) -> Application | None:
    return session.get(Application, app_id)


def change_status(
    session: Session,
    app_id: int,
    to_status: str,
    reason: str | None,
    meta: dict | None = None,
    label: str | None = None,
) -> Application:
    """Lock the row, check the transition, update the status and write history."""
    app = session.scalars(
        select(Application)
        .where(Application.id == app_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    ).one_or_none()
    if app is None:
        raise ValueError(f"application {app_id} not found")
    from_status = app.status
    check_transition(from_status, to_status)
    app.status = to_status
    app.status_label = label or to_status
    app.updated_at = func.now()
    session.add(
        StatusHistory(
            application_id=app_id,
            from_status=from_status,
            to_status=to_status,
            reason=reason,
            meta=meta or {},
        )
    )
    session.flush()
    session.refresh(app)
    return app


def save_source_check(
    session: Session,
    app_id: int,
    source: str,
    status: str,
    attempts: int = 1,
    latency_ms: int | None = None,
    payload: Any = None,
    message: str | None = None,
) -> None:
    session.add(
        SourceCheck(
            application_id=app_id,
            source=source,
            status=status,
            attempts=attempts,
            latency_ms=latency_ms,
            payload=payload,
            message=message,
        )
    )
    session.flush()


def save_recommendation(session: Session, app_id: int, data: dict) -> None:
    app = session.get(Application, app_id)
    if app is None:
        raise ValueError(f"application {app_id} not found")
    app.recommendation = data
    app.updated_at = func.now()
    session.flush()


def take_submitted(session: Session, limit: int) -> list[Application]:
    """Lock up to `limit` submitted applications; locks last until the transaction ends."""
    stmt = (
        select(Application)
        .where(Application.status == "submitted")
        .order_by(Application.id)
        .limit(limit)
        .with_for_update(skip_locked=True)
    )
    return list(session.scalars(stmt))
