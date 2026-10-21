from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.errors import ApiError
from app.models import (
    ActorType,
    Application,
    ApplicationStatus,
    Company,
    Decision,
    Loan,
    Product,
    StatusHistory,
    User,
)
from app.models.base import utcnow
from app.schemas.applications import ApplicationCreate, ApplicationUpdate
from app.services import audit
from app.services.finance import build_schedule, monthly_payment
from app.state.machine import SYSTEM_ACTOR, Actor, actor_from_user, transition

REQUIRED_CONSENTS = ("personal_data", "bki_request", "terms")


def application_options():
    return (
        selectinload(Application.company),
        selectinload(Application.product),
        selectinload(Application.taken_by),
        selectinload(Application.documents),
        selectinload(Application.source_checks),
        selectinload(Application.scores),
        selectinload(Application.rule_results),
        selectinload(Application.decisions).selectinload(Decision.decided_by),
        selectinload(Application.history).selectinload(StatusHistory.actor),
        selectinload(Application.loan),
    )


def get_application(db: Session, application_id: int) -> Application:
    statement = (
        select(Application)
        .where(Application.id == application_id)
        .options(*application_options())
        .execution_options(populate_existing=True)
    )
    application = db.scalar(statement)
    if application is None:
        raise ApiError(404, "application_not_found", "Заявка не найдена")
    return application


def get_application_for_user(db: Session, application_id: int, user: User) -> Application:
    application = get_application(db, application_id)
    if user.role.value == "client" and application.company_id != user.company_id:
        raise ApiError(404, "application_not_found", "Заявка не найдена")
    return application


def next_number(db: Session) -> str:
    today = date.today()
    prefix = f"{today.year}-{today.month:02d}-"
    last = db.scalar(
        select(func.max(Application.number)).where(Application.number.like(f"{prefix}%"))
    )
    sequence = 1
    if last:
        try:
            sequence = int(last.rsplit("-", 1)[1]) + 1
        except (IndexError, ValueError):
            sequence = 1
    return f"{prefix}{sequence:04d}"


def validate_product_terms(product: Product, amount: int, term_months: int) -> None:
    if not product.is_active:
        raise ApiError(422, "product_inactive", "Продукт недоступен")
    if not product.min_amount <= amount <= product.max_amount:
        raise ApiError(
            422,
            "amount_out_of_range",
            f"Сумма должна быть от {product.min_amount} до {product.max_amount} ₽",
        )
    if not product.min_term_months <= term_months <= product.max_term_months:
        raise ApiError(
            422,
            "term_out_of_range",
            f"Срок должен быть от {product.min_term_months} до {product.max_term_months} мес.",
        )


def _product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise ApiError(404, "product_not_found", "Продукт не найден")
    return product


def create_application(db: Session, user: User, data: ApplicationCreate) -> Application:
    if user.company_id is None:
        raise ApiError(422, "company_required", "У клиента не указана компания")
    company = db.get(Company, user.company_id)
    if company is None:
        raise ApiError(404, "company_not_found", "Компания не найдена")
    product = _product(db, data.product_id)
    validate_product_terms(product, data.amount, data.term_months)

    application = Application(
        number=next_number(db),
        company_id=company.id,
        product_id=product.id,
        amount=data.amount,
        term_months=data.term_months,
        purpose=data.purpose.strip(),
        task_code=data.task_code,
        needed_by=data.needed_by,
        repayment_source=data.repayment_source,
        consents=data.consents or {},
        status=ApplicationStatus.draft,
        labels=[],
        created_by_id=user.id,
    )
    db.add(application)
    db.flush()
    audit.record(
        db,
        actor_type=ActorType.client,
        actor_id=user.id,
        action="application_created",
        application_id=application.id,
        after={
            "number": application.number,
            "product_id": application.product_id,
            "amount": application.amount,
            "term_months": application.term_months,
            "purpose": application.purpose,
        },
    )
    db.commit()
    return get_application(db, application.id)


def update_application(
    db: Session, application: Application, data: ApplicationUpdate, user: User
) -> Application:
    if application.status != ApplicationStatus.draft:
        raise ApiError(409, "invalid_state", "Редактировать можно только черновик")
    changes = data.model_dump(exclude_unset=True)
    if not changes:
        return application

    product_id = changes.get("product_id", application.product_id)
    product = _product(db, product_id)
    amount = changes.get("amount", application.amount)
    term_months = changes.get("term_months", application.term_months)
    validate_product_terms(product, amount, term_months)

    before: dict[str, object] = {}
    after: dict[str, object] = {}
    for field, value in changes.items():
        old_value = getattr(application, field)
        if field == "purpose" and value is not None:
            value = str(value).strip()
        if field == "consents" and value is not None:
            value = {**(application.consents or {}), **value}
        if old_value == value:
            continue
        before[field] = old_value
        after[field] = value
        setattr(application, field, value)
    if not after:
        return application
    application.updated_at = utcnow()
    audit.record(
        db,
        actor_type=ActorType.client,
        actor_id=user.id,
        action="application_updated",
        application_id=application.id,
        before=before,
        after=after,
    )
    db.commit()
    return get_application(db, application.id)


def ensure_ready_to_submit(application: Application) -> None:
    missing: list[str] = []
    if not application.product_id:
        missing.append("product")
    if not application.amount or application.amount <= 0:
        missing.append("amount")
    if not application.term_months or application.term_months <= 0:
        missing.append("term_months")
    if not (application.purpose or "").strip():
        missing.append("purpose")
    if missing:
        raise ApiError(
            422,
            "missing_required_fields",
            "Заполните обязательные поля: " + ", ".join(missing),
        )
    consents = application.consents or {}
    missing_consents = [key for key in REQUIRED_CONSENTS if consents.get(key) is not True]
    if missing_consents:
        raise ApiError(
            422,
            "consents_required",
            "Нужны согласия: " + ", ".join(missing_consents),
        )


def submit_application(db: Session, application: Application, user: User) -> Application:
    # Проверку статуса делает transition(): недопустимый переход — 409 invalid_transition.
    if application.status == ApplicationStatus.draft:
        ensure_ready_to_submit(application)
    transition(db, application, ApplicationStatus.submitted, actor_from_user(user))
    db.commit()
    return get_application(db, application.id)


def withdraw_application(
    db: Session, application: Application, user: User, reason: str | None
) -> Application:
    transition(
        db,
        application,
        ApplicationStatus.withdrawn,
        actor_from_user(user),
        {"comment": reason or "Клиент отозвал заявку"},
    )
    db.commit()
    return get_application(db, application.id)


def accept_offer(db: Session, application: Application, user: User) -> Application:
    # Допустимость перехода проверяет transition(), чтобы код ошибки был единым.
    transition(db, application, ApplicationStatus.signing, actor_from_user(user))
    db.commit()
    return get_application(db, application.id)


def decline_offer(
    db: Session, application: Application, user: User, reason: str | None
) -> Application:
    transition(
        db,
        application,
        ApplicationStatus.client_declined,
        actor_from_user(user),
        {"comment": reason or "Клиент отказался от предложения"},
    )
    db.commit()
    return get_application(db, application.id)


def sign_application(db: Session, application: Application, user: User) -> Application:
    # transition() ниже отклонит подписание не на этапе signing.
    decision = application.latest_decision
    amount = (decision.amount if decision and decision.amount else application.amount) or 0
    term_months = (
        decision.term_months if decision and decision.term_months else application.term_months
    ) or 0
    rate = decision.rate if decision and decision.rate else application.product.rate
    payment = monthly_payment(amount, term_months, rate)

    transition(db, application, ApplicationStatus.signed, actor_from_user(user))
    existing = db.scalar(select(Loan).where(Loan.application_id == application.id))
    if existing is None:
        db.add(
            Loan(
                application_id=application.id,
                company_id=application.company_id,
                amount=amount,
                term_months=term_months,
                rate=rate,
                monthly_payment=payment,
                schedule=build_schedule(amount, term_months, rate, datetime.now().date()),
            )
        )
    transition(db, application, ApplicationStatus.issued, SYSTEM_ACTOR)
    db.commit()
    return get_application(db, application.id)


def resubmit_application(db: Session, application: Application, user: User) -> Application:
    if application.status not in {
        ApplicationStatus.rejected,
        ApplicationStatus.client_declined,
        ApplicationStatus.withdrawn,
    }:
        raise ApiError(
            409,
            "invalid_transition",
            "Повторно подать можно отклонённую или отозванную заявку",
        )
    ensure_ready_to_submit(application)
    # Новый цикл: заявку снова может взять любой андеррайтер.
    application.decided_at = None
    application.taken_by_id = None
    transition(
        db,
        application,
        ApplicationStatus.submitted,
        actor_from_user(user),
        {"labels": ["Повторная подача"]},
    )
    db.commit()
    return get_application(db, application.id)


def list_applications(
    db: Session,
    user: User,
    *,
    status: ApplicationStatus | None = None,
    product_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[Application], int]:
    filters = []
    if user.role.value == "client":
        filters.append(Application.company_id == user.company_id)
    if status is not None:
        filters.append(Application.status == status)
    if product_id is not None:
        filters.append(Application.product_id == product_id)

    total = db.scalar(select(func.count(Application.id)).where(*filters)) or 0
    statement = (
        select(Application)
        .where(*filters)
        .options(*application_options())
        .order_by(Application.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(statement).unique()), total


def actor_for(user: User) -> Actor:
    return actor_from_user(user)
