from __future__ import annotations

from datetime import datetime

from app.models import (
    ActorType,
    Application,
    ApplicationStatus,
    AuditLog,
    DecisionOutcome,
    Document,
    Loan,
    Notification,
    SourceCheck,
)
from app.schemas.applications import (
    ApplicationDetail,
    ApplicationListItem,
    ClientDecisionOut,
    DocumentOut,
    HistoryItemOut,
    LoanOut,
    LoanScheduleItem,
    NotificationOut,
    RuleResultOut,
    ScoreOut,
    SourceCheckOut,
    StatusStageOut,
)
from app.schemas.auth import CompanyOut
from app.schemas.bank import (
    AuditItemOut,
    BankApplicationDetail,
    BankDecisionOut,
    BankQueueItem,
)
from app.schemas.products import ProductOut
from app.state.machine import status_label

DECISION_LABELS = {
    DecisionOutcome.approve: "Одобрено",
    DecisionOutcome.counter: "Встречное предложение",
    DecisionOutcome.request: "Запрошены данные",
    DecisionOutcome.decline: "Отказ",
}
SOURCE_LABELS = {
    "egrul": "ЕГРЮЛ / ЕГРИП",
    "fns": "ФНС «Прозрачный бизнес»",
    "bki": "Бюро кредитных историй",
    "statement": "Выписка по счёту",
}
STAGE_DEFINITIONS = [
    ("submitted", "Заявка отправлена"),
    ("processing", "Проверяем данные"),
    ("manual_review", "Рассматривает специалист"),
    ("decision", "Решение"),
    ("signing", "Подписание"),
    ("issued", "Деньги на счёте"),
]
STAGE_RANK = {
    ApplicationStatus.draft: (-1, 0),
    ApplicationStatus.submitted: (0, 1),
    ApplicationStatus.processing: (0, 2),
    ApplicationStatus.manual_review: (1, 3),
    ApplicationStatus.client_action: (1, 3),
    ApplicationStatus.approved: (3, 4),
    ApplicationStatus.counter_offer: (3, 4),
    ApplicationStatus.rejected: (3, 3),
    ApplicationStatus.client_declined: (3, 3),
    ApplicationStatus.withdrawn: (3, 3),
    ApplicationStatus.signing: (3, 4),
    ApplicationStatus.signed: (4, 5),
    ApplicationStatus.issued: (5, 5),
}


def company_out(application: Application) -> CompanyOut:
    return CompanyOut.model_validate(application.company)


def product_out(application: Application) -> ProductOut:
    return ProductOut.model_validate(application.product)


def document_out(document: Document) -> DocumentOut:
    return DocumentOut.model_validate(document)


def source_check_out(check: SourceCheck) -> SourceCheckOut:
    return SourceCheckOut(
        id=check.id,
        source=check.source,
        source_label=SOURCE_LABELS.get(check.source, check.source),
        status=check.status,
        response=check.response or {},
        response_time_ms=check.response_time_ms,
        attempts=check.attempts,
        checked_at=check.checked_at,
    )


def score_out(application: Application) -> ScoreOut | None:
    score = application.latest_score
    if score is None:
        return None
    return ScoreOut(
        score=score.score,
        risk_class=score.risk_class,
        model_version=score.model_version,
        factors=score.factors or [],
        created_at=score.created_at,
    )


def rule_results_out(application: Application) -> list[RuleResultOut]:
    return [
        RuleResultOut(
            code=rule.code,
            value=rule.value,
            threshold=rule.threshold,
            passed=rule.passed,
            comment=rule.comment,
        )
        for rule in application.rule_results
    ]


def client_decision(application: Application) -> ClientDecisionOut | None:
    decision = application.current_decision
    if decision is None:
        return None
    return ClientDecisionOut(
        outcome=decision.outcome,
        outcome_label=DECISION_LABELS[decision.outcome],
        amount=decision.amount,
        term_months=decision.term_months,
        rate=decision.rate,
        monthly_payment=decision.monthly_payment,
        requested_documents=decision.requested_documents or [],
        client_message=decision.client_message,
        decline_reason=decision.decline_reason,
        decided_at=decision.decided_at,
    )


def bank_decision(application: Application) -> BankDecisionOut | None:
    decision = application.current_decision
    if decision is None:
        return None
    return BankDecisionOut(
        outcome=decision.outcome,
        outcome_label=DECISION_LABELS[decision.outcome],
        amount=decision.amount,
        term_months=decision.term_months,
        rate=decision.rate,
        monthly_payment=decision.monthly_payment,
        requested_documents=decision.requested_documents or [],
        client_message=decision.client_message,
        decline_reason=decision.decline_reason,
        internal_comment=decision.internal_comment,
        decided_by_name=decision.decided_by.full_name if decision.decided_by else None,
        decided_at=decision.decided_at,
    )


def actor_name(actor_type: ActorType, actor_id: int | None, actor: object | None) -> str:
    if actor_type == ActorType.system:
        return "Система"
    full_name = getattr(actor, "full_name", None)
    if full_name:
        return str(full_name)
    return "Клиент" if actor_type == ActorType.client else "Сотрудник"


def history_out(application: Application) -> list[HistoryItemOut]:
    return [
        HistoryItemOut(
            from_status=item.from_status,
            to_status=item.to_status,
            from_label=status_label(item.from_status),
            to_label=status_label(item.to_status),
            actor_type=item.actor_type,
            actor_name=actor_name(item.actor_type, item.actor_id, item.actor),
            comment=item.comment,
            created_at=item.created_at,
        )
        for item in sorted(application.history, key=lambda row: row.created_at)
    ]


def stages_out(application: Application) -> list[StatusStageOut]:
    done_rank, current_rank = STAGE_RANK[application.status]
    timestamps: dict[str, datetime] = {}
    if application.submitted_at:
        timestamps["submitted"] = application.submitted_at
    if application.decided_at:
        timestamps["decision"] = application.decided_at
    for item in application.history:
        key = {
            ApplicationStatus.processing: "processing",
            ApplicationStatus.manual_review: "manual_review",
            ApplicationStatus.signing: "signing",
            ApplicationStatus.issued: "issued",
        }.get(item.to_status)
        if key and key not in timestamps:
            timestamps[key] = item.created_at

    terminal = application.status in {
        ApplicationStatus.rejected,
        ApplicationStatus.client_declined,
        ApplicationStatus.withdrawn,
    }
    stages: list[StatusStageOut] = []
    for index, (key, title) in enumerate(STAGE_DEFINITIONS):
        if index <= done_rank:
            state = "done"
        elif index == current_rank:
            state = "current"
        else:
            state = "pending"
        description = None
        if key == "manual_review" and application.status == ApplicationStatus.client_action:
            description = "Банк запросил документы — загрузите их в заявке"
        elif key == "decision" and terminal:
            description = f"Заявка: {status_label(application.status).lower()}"
        elif key == "issued" and application.status == ApplicationStatus.issued:
            description = "Кредит выдан, график платежей в разделе «Мои кредиты»"
        stages.append(
            StatusStageOut(
                key=key,
                title=title,
                status=state,
                at=timestamps.get(key),
                description=description,
            )
        )
    return stages


def application_list_item(application: Application) -> ApplicationListItem:
    return ApplicationListItem(
        id=application.id,
        number=application.number,
        company_id=application.company_id,
        company_name=application.company.name,
        product_id=application.product_id,
        product_name=application.product.name,
        amount=application.amount,
        term_months=application.term_months,
        status=application.status,
        status_label=status_label(application.status),
        labels=application.labels or [],
        created_at=application.created_at,
        submitted_at=application.submitted_at,
        decided_at=application.decided_at,
        taken_by_name=application.taken_by.full_name if application.taken_by else None,
    )


def application_detail(application: Application) -> ApplicationDetail:
    return ApplicationDetail(
        id=application.id,
        number=application.number,
        company=company_out(application),
        product=product_out(application),
        amount=application.amount,
        term_months=application.term_months,
        purpose=application.purpose,
        task_code=application.task_code,
        needed_by=application.needed_by,
        repayment_source=application.repayment_source,
        consents=application.consents or {},
        status=application.status,
        status_label=status_label(application.status),
        labels=application.labels or [],
        created_at=application.created_at,
        submitted_at=application.submitted_at,
        decided_at=application.decided_at,
        taken_by_name=application.taken_by.full_name if application.taken_by else None,
        documents=[
            document_out(document)
            for document in sorted(application.documents, key=lambda row: row.uploaded_at)
        ],
        decision=client_decision(application),
        stages=stages_out(application),
        history=history_out(application),
    )


def recommendation_for(application: Application) -> tuple[str | None, str | None]:
    if application.status in {ApplicationStatus.draft, ApplicationStatus.submitted}:
        return None, None
    score = application.latest_score
    failed = [rule for rule in application.rule_results if not rule.passed]
    if failed:
        hard_failure = any(
            rule.code in {"tax_debt", "business_age", "risk_class", "credit_history"}
            for rule in failed
        )
        if hard_failure:
            return "decline", f"Не пройдено правил: {len(failed)} — {failed[0].code}"
        return "counter", f"Не пройдено правило «{failed[0].code}», можно изменить условия"
    if score is None:
        return "request", "Нет скоринга — нужна ручная проверка"
    if score.risk_class in {"A", "B"}:
        return "approve", f"Класс {score.risk_class}, балл {score.score} — в пределах политики"
    if score.risk_class == "C":
        return "counter", f"Класс C, балл {score.score} — предложить меньшую сумму"
    return "decline", f"Класс {score.risk_class}, балл {score.score} — ниже политики"


def bank_queue_item(application: Application) -> BankQueueItem:
    recommendation, reason = recommendation_for(application)
    score = application.latest_score
    return BankQueueItem(
        id=application.id,
        number=application.number,
        company_id=application.company_id,
        company_name=application.company.name,
        inn=application.company.inn,
        product_id=application.product_id,
        product_name=application.product.name,
        amount=application.amount,
        term_months=application.term_months,
        risk_class=score.risk_class if score else None,
        recommendation=recommendation,
        recommendation_reason=reason,
        stage=status_label(application.status),
        status=application.status,
        status_label=status_label(application.status),
        tags=application.labels or [],
        taken_by_name=application.taken_by.full_name if application.taken_by else None,
        created_at=application.created_at,
        submitted_at=application.submitted_at,
    )


def bank_application_detail(application: Application) -> BankApplicationDetail:
    recommendation, reason = recommendation_for(application)
    return BankApplicationDetail(
        id=application.id,
        number=application.number,
        company=company_out(application),
        product=product_out(application),
        amount=application.amount,
        term_months=application.term_months,
        purpose=application.purpose,
        task_code=application.task_code,
        needed_by=application.needed_by,
        repayment_source=application.repayment_source,
        consents=application.consents or {},
        status=application.status,
        status_label=status_label(application.status),
        labels=application.labels or [],
        created_at=application.created_at,
        submitted_at=application.submitted_at,
        decided_at=application.decided_at,
        taken_by_name=application.taken_by.full_name if application.taken_by else None,
        documents=[
            document_out(document)
            for document in sorted(application.documents, key=lambda row: row.uploaded_at)
        ],
        checks=[source_check_out(check) for check in application.latest_checks],
        score=score_out(application),
        rules=rule_results_out(application),
        decision=bank_decision(application),
        recommendation=recommendation,
        recommendation_reason=reason,
        stages=stages_out(application),
        history=history_out(application),
    )


def notification_out(notification: Notification) -> NotificationOut:
    return NotificationOut.model_validate(notification)


def loan_out(loan: Loan) -> LoanOut:
    return LoanOut(
        id=loan.id,
        application_id=loan.application_id,
        application_number=loan.application.number,
        product_name=loan.application.product.name,
        amount=loan.amount,
        term_months=loan.term_months,
        rate=loan.rate,
        monthly_payment=loan.monthly_payment,
        issued_at=loan.issued_at,
        schedule=[LoanScheduleItem(**row) for row in (loan.schedule or [])],
    )


def audit_item(
    entry: AuditLog, application_number: str | None, actor: object | None
) -> AuditItemOut:
    return AuditItemOut(
        id=entry.id,
        created_at=entry.created_at,
        actor_type=entry.actor_type,
        actor_name=actor_name(entry.actor_type, entry.actor_id, actor),
        action=entry.action,
        application_id=entry.application_id,
        application_number=application_number,
        before=entry.before,
        after=entry.after,
    )
