from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.errors import ApiError
from app.models import (
    ActorType,
    Application,
    ApplicationStatus,
    AuditLog,
    Company,
    Decision,
    DecisionOutcome,
    Score,
    SourceCheck,
    SourceStatus,
    User,
)
from app.models.base import utcnow
from app.schemas.bank import (
    AuditList,
    BankApplicationDetail,
    BankQueueResponse,
    DecisionRequest,
    QueueCounters,
    SourceHealthList,
    SourceHealthOut,
)
from app.services import audit
from app.services.applications import application_options, get_application
from app.services.finance import monthly_payment
from app.services.presenters import (
    SOURCE_LABELS,
    audit_item,
    bank_application_detail,
    bank_queue_item,
)
from app.state.machine import actor_from_user, transition

SOURCE_RULES = {
    "egrul": "Заявка ждёт до 3 попыток, затем — ручная проверка",
    "fns": "Ручная проверка налоговой задолженности",
    "bki": "Заявка уходит на ручную проверку",
    "statement": "Клиенту предлагают загрузить выписку файлом",
}


def _latest_score_subquery():
    return (
        select(Score.application_id, func.max(Score.created_at).label("max_created"))
        .group_by(Score.application_id)
        .subquery()
    )


def queue(
    db: Session,
    user: User,
    *,
    status: ApplicationStatus | None = None,
    product_id: int | None = None,
    risk_class: str | None = None,
    amount_min: int | None = None,
    amount_max: int | None = None,
    query: str | None = None,
    mine: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> BankQueueResponse:
    filters = [Application.status != ApplicationStatus.draft]
    if status is not None:
        filters.append(Application.status == status)
    if product_id is not None:
        filters.append(Application.product_id == product_id)
    if amount_min is not None:
        filters.append(Application.amount >= amount_min)
    if amount_max is not None:
        filters.append(Application.amount <= amount_max)
    if mine:
        filters.append(Application.taken_by_id == user.id)
    if query:
        pattern = f"%{query.strip()}%"
        filters.append(
            or_(
                Application.number.ilike(pattern),
                Application.company.has(Company.inn.ilike(pattern)),
                Application.company.has(Company.name.ilike(pattern)),
            )
        )

    statement = (
        select(Application)
        .where(*filters)
        .options(*application_options())
        .order_by(Application.created_at.desc())
    )
    if risk_class:
        latest = _latest_score_subquery()
        statement = (
            statement.join(latest, latest.c.application_id == Application.id)
            .join(
                Score,
                (Score.application_id == Application.id)
                & (Score.created_at == latest.c.max_created),
            )
            .where(Score.risk_class == risk_class.upper())
        )

    applications = list(db.scalars(statement).unique())
    total = len(applications)
    page = applications[offset : offset + limit]

    counts = dict(
        db.execute(
            select(Application.status, func.count(Application.id))
            .where(Application.status != ApplicationStatus.draft)
            .group_by(Application.status)
        ).all()
    )
    decided = {
        ApplicationStatus.approved,
        ApplicationStatus.counter_offer,
        ApplicationStatus.rejected,
        ApplicationStatus.client_declined,
        ApplicationStatus.issued,
    }
    counters = QueueCounters(
        new=counts.get(ApplicationStatus.submitted, 0),
        pipeline=counts.get(ApplicationStatus.processing, 0),
        manual=counts.get(ApplicationStatus.manual_review, 0),
        client=counts.get(ApplicationStatus.client_action, 0),
        decided=sum(counts.get(item, 0) for item in decided),
    )
    return BankQueueResponse(
        items=[bank_queue_item(application) for application in page],
        total=total,
        counters=counters,
    )


def card(db: Session, application_id: int) -> BankApplicationDetail:
    return bank_application_detail(get_application(db, application_id))


def take(db: Session, application_id: int, user: User) -> BankApplicationDetail:
    application = get_application(db, application_id)
    if application.taken_by_id is not None and application.taken_by_id != user.id:
        raise ApiError(409, "already_taken", "Заявку уже взял другой сотрудник")
    if application.status not in {ApplicationStatus.submitted, ApplicationStatus.manual_review}:
        raise ApiError(
            409,
            "invalid_transition",
            "Взять в работу можно новую или ручную заявку",
        )

    before = {"taken_by_id": application.taken_by_id}
    application.taken_by_id = user.id
    if application.status == ApplicationStatus.submitted:
        transition(
            db,
            application,
            ApplicationStatus.manual_review,
            actor_from_user(user),
            {"comment": "Заявка взята в работу"},
        )
    audit.record(
        db,
        actor_type=ActorType.underwriter,
        actor_id=user.id,
        action="application_taken",
        application_id=application.id,
        before=before,
        after={"taken_by_id": user.id, "taken_by_name": user.full_name},
    )
    db.commit()
    return card(db, application.id)


def decide(
    db: Session, application_id: int, user: User, data: DecisionRequest
) -> BankApplicationDetail:
    application = get_application(db, application_id)
    if application.status != ApplicationStatus.manual_review:
        raise ApiError(
            409,
            "invalid_transition",
            "Решение принимается по заявке на ручном рассмотрении",
        )

    product = application.product
    amount = data.amount or application.amount
    term_months = data.term_months or application.term_months
    rate = data.rate or product.rate
    payment = monthly_payment(amount, term_months, rate)

    if data.outcome == DecisionOutcome.request and not data.requested_documents:
        raise ApiError(422, "documents_required", "Укажите, какие документы запросить")
    if data.outcome == DecisionOutcome.decline and not (data.decline_reason or data.client_message):
        raise ApiError(422, "decline_reason_required", "Укажите причину отказа")

    target_status = {
        DecisionOutcome.approve: ApplicationStatus.approved,
        DecisionOutcome.counter: ApplicationStatus.counter_offer,
        DecisionOutcome.request: ApplicationStatus.client_action,
        DecisionOutcome.decline: ApplicationStatus.rejected,
    }[data.outcome]

    decision = Decision(
        application_id=application.id,
        outcome=data.outcome,
        amount=amount if data.outcome != DecisionOutcome.request else None,
        term_months=term_months if data.outcome != DecisionOutcome.request else None,
        rate=rate if data.outcome != DecisionOutcome.request else None,
        monthly_payment=payment if data.outcome != DecisionOutcome.request else None,
        requested_documents=data.requested_documents,
        client_message=data.client_message,
        decline_reason=data.decline_reason,
        internal_comment=data.internal_comment,
        decided_by_id=user.id,
        decided_at=utcnow(),
    )
    db.add(decision)
    application.decisions.append(decision)

    transition(
        db,
        application,
        target_status,
        actor_from_user(user),
        {"comment": data.client_message or data.internal_comment},
    )
    audit.record(
        db,
        actor_type=ActorType.underwriter,
        actor_id=user.id,
        action="decision_made",
        application_id=application.id,
        after={
            "outcome": data.outcome.value,
            "amount": amount,
            "term_months": term_months,
            "rate": rate,
            "requested_documents": data.requested_documents,
            "client_message": data.client_message,
            "decline_reason": data.decline_reason,
            "internal_comment": data.internal_comment,
        },
    )
    db.commit()
    return card(db, application.id)


def audit_log(
    db: Session,
    *,
    actor_type: ActorType | None = None,
    application_id: int | None = None,
    action: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> AuditList:
    filters = []
    if actor_type is not None:
        filters.append(AuditLog.actor_type == actor_type)
    if application_id is not None:
        filters.append(AuditLog.application_id == application_id)
    if action:
        filters.append(AuditLog.action == action)

    total = db.scalar(select(func.count(AuditLog.id)).where(*filters)) or 0
    entries = list(
        db.scalars(
            select(AuditLog)
            .where(*filters)
            .options(selectinload(AuditLog.actor))
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    )
    application_ids = {entry.application_id for entry in entries if entry.application_id}
    numbers: dict[int, str] = {}
    if application_ids:
        numbers = dict(
            db.execute(
                select(Application.id, Application.number).where(
                    Application.id.in_(application_ids)
                )
            ).all()
        )
    items = [
        audit_item(entry, numbers.get(entry.application_id or 0), entry.actor) for entry in entries
    ]
    return AuditList(items=items, total=total)


def sources(db: Session) -> SourceHealthList:
    now = datetime.now(UTC)
    hour_ago = now - timedelta(hours=1)
    items: list[SourceHealthOut] = []
    for code, name in SOURCE_LABELS.items():
        checks = list(
            db.scalars(
                select(SourceCheck)
                .where(SourceCheck.source == code)
                .order_by(SourceCheck.checked_at.desc())
                .limit(50)
            )
        )
        latest = checks[0] if checks else None
        errors = 0
        for check in checks:
            checked_at = check.checked_at
            if checked_at.tzinfo is None:
                checked_at = checked_at.replace(tzinfo=UTC)
            if checked_at >= hour_ago and check.status in {
                SourceStatus.fail,
                SourceStatus.unavailable,
            }:
                errors += 1
        average = (
            round(sum(check.response_time_ms for check in checks) / len(checks)) if checks else None
        )
        status = latest.status if latest else SourceStatus.ok
        items.append(
            SourceHealthOut(
                code=code,
                name=name,
                status=status,
                avg_response_ms=average,
                errors=errors,
                last_checked_at=latest.checked_at if latest else None,
                rule=SOURCE_RULES[code],
            )
        )
    return SourceHealthList(items=items)
