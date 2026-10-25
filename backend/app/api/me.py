from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_client
from app.errors import ApiError
from app.models import Company, Product, User
from app.schemas.auth import UserOut
from app.schemas.products import (
    CalculatorResponse,
    CashflowResponse,
    ProductOut,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services import finance

router = APIRouter(tags=["client"])


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


@router.get("/me/cashflow", response_model=CashflowResponse)
def my_cashflow(
    user: User = Depends(require_client), db: Session = Depends(get_db)
) -> CashflowResponse:
    if user.company_id is None:
        raise ApiError(404, "company_not_found", "У компании нет данных по счёту")
    company = db.get(Company, user.company_id)
    if company is None:
        raise ApiError(404, "company_not_found", "Компания не найдена")
    return finance.cashflow(db, company)


@router.get("/products", response_model=list[ProductOut])
def products(db: Session = Depends(get_db)) -> list[ProductOut]:
    rows = db.scalars(select(Product).where(Product.is_active.is_(True)).order_by(Product.id)).all()
    return [ProductOut.model_validate(product) for product in rows]


@router.post("/recommendations", response_model=RecommendationResponse)
def recommendations(
    payload: RecommendationRequest, db: Session = Depends(get_db)
) -> RecommendationResponse:
    return finance.recommend(
        db,
        task=payload.task,
        amount=payload.amount,
        term_months=payload.term_months,
        product_id=payload.product_id,
    )


@router.get("/calculator", response_model=CalculatorResponse)
def calculator(
    amount: int = Query(gt=0),
    term_months: int = Query(gt=0, le=360),
    product_id: int | None = None,
    rate: float | None = Query(default=None, gt=0, le=100),
    db: Session = Depends(get_db),
) -> CalculatorResponse:
    return finance.calculate(db, amount, term_months, product_id, rate)
