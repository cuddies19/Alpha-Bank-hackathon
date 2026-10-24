from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: str
    min_amount: int
    max_amount: int
    min_term_months: int
    max_term_months: int
    rate: float
    requires_collateral: bool
    decision_time: str | None = None
    features: list[str] = []


class RecommendationRequest(BaseModel):
    task: str = Field(min_length=2, max_length=2000)
    amount: int | None = Field(default=None, gt=0)
    term_months: int | None = Field(default=None, gt=0)
    product_id: int | None = None


class RecommendationItem(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    amount: int
    term_months: int
    rate: float
    monthly_payment: int
    match_score: int
    reason: str


class RecommendationResponse(BaseModel):
    items: list[RecommendationItem]
    summary: str


class CalculatorResponse(BaseModel):
    amount: int
    term_months: int
    rate: float
    monthly_payment: int
    total_payment: int
    total_interest: int
    product_id: int | None = None
    product_name: str | None = None


class CashflowMonth(BaseModel):
    month: str
    inflows: int
    outflows: int
    net_flow: int
    balance: int


class CashflowResponse(BaseModel):
    balance: int
    inflows: int
    net_flow: int
    loan_payments: int
    months: list[CashflowMonth]
