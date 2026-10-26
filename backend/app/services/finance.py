from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.models import Company, Loan, Product
from app.schemas.products import (
    CalculatorResponse,
    CashflowMonth,
    CashflowResponse,
    RecommendationItem,
    RecommendationResponse,
)
from app.services import statements


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, 28)
    return date(year, month, day)


def monthly_payment(amount: int, term_months: int, rate: float) -> int:
    if term_months <= 0:
        raise ApiError(422, "invalid_term", "Срок должен быть больше нуля")
    monthly_rate = rate / 100 / 12
    if monthly_rate == 0:
        return round(amount / term_months)
    coefficient = monthly_rate / (1 - (1 + monthly_rate) ** (-term_months))
    return round(amount * coefficient)


def build_schedule(
    amount: int, term_months: int, rate: float, start: date | None = None
) -> list[dict[str, Any]]:
    start = start or date.today()
    payment = monthly_payment(amount, term_months, rate)
    monthly_rate = rate / 100 / 12
    remaining = amount
    rows: list[dict[str, Any]] = []
    for index in range(1, term_months + 1):
        interest = round(remaining * monthly_rate)
        principal = payment - interest
        if index == term_months:
            principal = remaining
        principal = max(0, min(principal, remaining))
        remaining = max(0, remaining - principal)
        rows.append(
            {
                "number": index,
                "date": add_months(start, index).isoformat(),
                "amount": principal + interest,
                "principal": principal,
                "interest": interest,
                "remaining": remaining,
            }
        )
    return rows


def get_product_or_404(db: Session, product_id: int | None) -> Product | None:
    if product_id is None:
        return None
    product = db.get(Product, product_id)
    if product is None or not product.is_active:
        raise ApiError(404, "product_not_found", "Продукт не найден")
    return product


def calculate(
    db: Session,
    amount: int,
    term_months: int,
    product_id: int | None = None,
    rate: float | None = None,
) -> CalculatorResponse:
    if amount <= 0 or term_months <= 0:
        raise ApiError(422, "invalid_calculator_input", "Сумма и срок должны быть больше нуля")
    product = get_product_or_404(db, product_id)
    effective_rate = rate or (product.rate if product else 21.5)
    payment = monthly_payment(amount, term_months, effective_rate)
    total = payment * term_months
    return CalculatorResponse(
        amount=amount,
        term_months=term_months,
        rate=effective_rate,
        monthly_payment=payment,
        total_payment=total,
        total_interest=max(0, total - amount),
        product_id=product.id if product else None,
        product_name=product.name if product else None,
    )


def recommend(
    db: Session,
    *,
    task: str,
    amount: int | None,
    term_months: int | None,
    product_id: int | None = None,
) -> RecommendationResponse:
    products = list(db.scalars(select(Product).where(Product.is_active.is_(True))))
    if not products:
        raise ApiError(404, "products_not_found", "Каталог продуктов пуст")
    if product_id is not None:
        products = [item for item in products if item.id == product_id]
        if not products:
            raise ApiError(404, "product_not_found", "Продукт не найден")

    requested_amount = amount or 3_000_000
    requested_term = term_months or 18
    normalized = task.lower()
    keywords = {
        "overdraft": ("кассов", "разрыв", "овердрафт", "постоянн"),
        "credit": ("закуп", "оборудован", "ремонт", "расшир", "любы"),
        "credit_line": ("линия", "оборот", "маркетплейс", "партия", "распродаж"),
    }

    scored: list[tuple[int, Product, int, int]] = []
    for product in products:
        score = 55
        if product.min_amount <= requested_amount <= product.max_amount:
            score += 20
        elif requested_amount > product.max_amount:
            score -= 15
        if product.min_term_months <= requested_term <= product.max_term_months:
            score += 10
        for keyword in keywords.get(product.code, ()):
            if keyword in normalized:
                score += 8
                break
        product_amount = min(max(requested_amount, product.min_amount), product.max_amount)
        product_term = min(max(requested_term, product.min_term_months), product.max_term_months)
        scored.append((min(score, 99), product, product_amount, product_term))

    scored.sort(key=lambda item: item[0], reverse=True)
    items: list[RecommendationItem] = []
    for score, product, product_amount, product_term in scored[:2]:
        payment = monthly_payment(product_amount, product_term, product.rate)
        reason = (
            f"Сумма и срок в лимитах продукта, ставка {product.rate:.1f}% годовых, "
            f"платёж около {payment:,} ₽ в месяц".replace(",", " ")
        )
        items.append(
            RecommendationItem(
                product_id=product.id,
                product_code=product.code,
                product_name=product.name,
                amount=product_amount,
                term_months=product_term,
                rate=product.rate,
                monthly_payment=payment,
                match_score=score,
                reason=reason,
            )
        )
    summary = (
        f"По задаче «{task.strip()[:160]}» лучше всего подходит {items[0].product_name}. "
        "Это предварительная оценка, решение принимает банк."
    )
    return RecommendationResponse(items=items, summary=summary)


def _money(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _cashflow_from_statement(
    statement: dict[str, Any], loan_payments: int
) -> CashflowResponse | None:
    raw_months = statement.get("months")
    if not isinstance(raw_months, list) or not raw_months:
        return None

    rows: list[tuple[str, int, int]] = []
    for item in raw_months:
        if not isinstance(item, dict):
            return None
        month = item.get("month")
        inflow = _money(item.get("inflow_rub"))
        outflow = _money(item.get("outflow_rub"))
        if not isinstance(month, str) or not month or inflow is None or outflow is None:
            return None
        rows.append((month, inflow, outflow))
    rows.sort(key=lambda row: row[0])

    balance = _money(statement.get("balance_rub")) or 0
    nets = [inflow - outflow for _, inflow, outflow in rows]
    balances = [0] * len(rows)
    running = balance
    for index in range(len(rows) - 1, -1, -1):
        balances[index] = running
        running -= nets[index]

    months = [
        CashflowMonth(
            month=month,
            inflows=inflow,
            outflows=outflow,
            net_flow=net,
            balance=balances[index],
        )
        for index, ((month, inflow, outflow), net) in enumerate(zip(rows, nets, strict=True))
    ]
    return CashflowResponse(
        balance=balance,
        inflows=sum(inflow for _, inflow, _ in rows),
        net_flow=sum(nets),
        loan_payments=loan_payments,
        months=months,
    )


def _generated_cashflow(company: Company, loan_payments: int) -> CashflowResponse:
    base_inflow = 380_000 + (company.id * 37_000) % 190_000
    coefficients = [1.0, 0.88, 1.12, 0.95, 1.06, 0.92]
    outflows_share = [0.71, 0.76, 0.69, 0.73, 0.70, 0.77]
    balance = 250_000 + (company.id * 53_000) % 300_000

    today = date.today()
    months: list[CashflowMonth] = []
    total_inflows = 0
    for offset in range(5, -1, -1):
        month_date = add_months(today.replace(day=1), -offset)
        inflow = round(base_inflow * coefficients[5 - offset])
        outflow = round(inflow * outflows_share[5 - offset]) + loan_payments
        net_flow = inflow - outflow
        balance += net_flow
        total_inflows += inflow
        months.append(
            CashflowMonth(
                month=month_date.strftime("%Y-%m"),
                inflows=inflow,
                outflows=outflow,
                net_flow=net_flow,
                balance=balance,
            )
        )
    return CashflowResponse(
        balance=balance,
        inflows=total_inflows,
        net_flow=sum(item.net_flow for item in months),
        loan_payments=loan_payments,
        months=months,
    )


def cashflow(db: Session, company: Company) -> CashflowResponse:
    loans = list(db.scalars(select(Loan).where(Loan.company_id == company.id)))
    loan_payments = sum(loan.monthly_payment for loan in loans)
    statement = statements.load(db, company)
    if statement:
        result = _cashflow_from_statement(statement, loan_payments)
        if result is not None:
            return result
    return _generated_cashflow(company, loan_payments)
