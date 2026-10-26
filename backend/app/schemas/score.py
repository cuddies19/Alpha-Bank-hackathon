from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ScoreFeatures(BaseModel):
    """Exactly the ten features agreed for POST /score."""

    model_config = ConfigDict(extra="forbid")

    business_age_months: int = Field(ge=0)
    income_last_year_rub: int = Field(ge=0)
    tax_debt_rub: int = Field(ge=0)
    max_overdue_days_12m: int = Field(ge=0)
    max_overdue_days_24m: int = Field(ge=0)
    inquiries_30d: int = Field(ge=0)
    avg_net_flow_rub: int
    marketplace_share: float = Field(ge=0, le=1)
    revenue_to_other_bank: bool
    monthly_payments_rub: int = Field(ge=0)


class ScoreRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    inn: str = Field(pattern=r"^\d{10}(\d{2})?$", description="ИНН юридического лица или ИП")
    features: ScoreFeatures


class ScoreResponse(BaseModel):
    score: int = Field(ge=300, le=850)
    risk_class: str = Field(pattern=r"^[A-E]$")
