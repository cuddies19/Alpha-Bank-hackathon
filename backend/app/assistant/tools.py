from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.models import Application, Loan, Product, User
from app.services import finance
from app.services.applications import application_options, ensure_ready_to_submit
from app.services.presenters import client_decision, stages_out
from app.state.machine import status_label

MAX_ID = 2**31 - 1
MISSING_LABELS = {
    "product": "продукт",
    "amount": "сумма",
    "term_months": "срок",
    "purpose": "цель кредита",
    "personal_data": "согласие на обработку персональных данных",
    "bki_request": "согласие на запрос в БКИ",
    "terms": "согласие с условиями",
}


def find_application(db: Session, user: User, application_id: int | None) -> Application | None:
    """Latest or given application of the user's company; someone else's is not found."""
    if application_id is not None and not 1 <= application_id <= MAX_ID:
        return None
    statement = (
        select(Application)
        .where(Application.company_id == user.company_id)
        .options(*application_options())
        .execution_options(populate_existing=True)
        .order_by(Application.created_at.desc(), Application.id.desc())
    )
    if application_id is not None:
        statement = statement.where(Application.id == application_id)
    return db.scalars(statement).first()


def account_summary(db: Session, user: User) -> dict[str, Any]:
    if user.company is None:
        return {"found": False}
    cash = finance.cashflow(db, user.company)
    loans = db.scalars(select(Loan).where(Loan.company_id == user.company.id)).all()
    return {
        "found": True,
        "company": user.company.name,
        "balance": cash.balance,
        "net_flow": cash.net_flow,
        "loan_payments": cash.loan_payments,
        "loans": [
            {
                "amount": loan.amount,
                "term_months": loan.term_months,
                "payment": loan.monthly_payment,
            }
            for loan in loans
        ],
    }


def match_products(db: Session, task: str, amount: int | None, term: int | None) -> dict[str, Any]:
    try:
        result = finance.recommend(db, task=task, amount=amount, term_months=term)
    except ApiError:
        return {"items": []}
    return {
        "items": [
            {
                "product_code": item.product_code,
                "product_name": item.product_name,
                "amount": item.amount,
                "term_months": item.term_months,
                "rate": item.rate,
                "monthly_payment": item.monthly_payment,
            }
            for item in result.items
        ]
    }


def calc_payment(
    db: Session, amount: int, term: int, product_code: str | None = None
) -> dict[str, Any]:
    product_id = None
    if product_code:
        product_id = db.scalar(select(Product.id).where(Product.code == product_code))
    try:
        result = finance.calculate(db, amount, term, product_id)
    except ApiError as error:
        return {"ok": False, "message": error.message}
    return {
        "ok": True,
        "amount": result.amount,
        "term_months": result.term_months,
        "rate": result.rate,
        "monthly_payment": result.monthly_payment,
        "total_payment": result.total_payment,
        "product_name": result.product_name,
    }


def application_status(
    db: Session, user: User, application_id: int | None = None
) -> dict[str, Any]:
    application = find_application(db, user, application_id)
    if application is None:
        return {"found": False}
    decision = client_decision(application)
    return {
        "found": True,
        "id": application.id,
        "number": application.number,
        "status": application.status.value,
        "status_label": status_label(application.status),
        "amount": application.amount,
        "term_months": application.term_months,
        "stages": [
            {"title": item.title, "status": item.status} for item in stages_out(application)
        ],
        "decision": decision.model_dump(mode="json") if decision else None,
    }


def explain_decision(db: Session, user: User, application_id: int | None = None) -> dict[str, Any]:
    application = find_application(db, user, application_id)
    if application is None:
        return {"found": False}
    decision = client_decision(application)
    result: dict[str, Any] = {"found": True, "id": application.id, "number": application.number}
    if decision is None:
        return {**result, "has_decision": False}
    return {
        **result,
        "has_decision": True,
        "outcome": decision.outcome.value,
        "outcome_label": decision.outcome_label,
        "amount": decision.amount,
        "term_months": decision.term_months,
        "rate": decision.rate,
        "monthly_payment": decision.monthly_payment,
        "message": decision.client_message,
        "decline_reason": decision.decline_reason,
        "requested_documents": decision.requested_documents,
    }


def completeness_check(
    db: Session, user: User, application_id: int | None = None
) -> dict[str, Any]:
    application = find_application(db, user, application_id)
    if application is None:
        return {"found": False}
    result: dict[str, Any] = {
        "found": True,
        "id": application.id,
        "number": application.number,
        "status": application.status.value,
        "ready": True,
        "missing": [],
    }
    try:
        ensure_ready_to_submit(application)
    except ApiError as error:
        names = error.message.split(": ", 1)[1].split(", ")
        result["ready"] = False
        result["missing"] = [MISSING_LABELS.get(name, name) for name in names]
    return result
