from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models import ActorType, ApplicationStatus, DecisionOutcome, SourceStatus
from app.schemas.applications import (
    ApplicationDetail,
    DocumentOut,
    HistoryItemOut,
    RuleResultOut,
    ScoreOut,
    SourceCheckOut,
    StatusStageOut,
)
from app.schemas.auth import CompanyOut
from app.schemas.products import ProductOut


class BankQueueItem(BaseModel):
    id: int
    number: str
    company_id: int
    company_name: str
    inn: str
    product_id: int
    product_name: str
    amount: int
    term_months: int
    risk_class: str | None = None
    recommendation: str | None = None
    recommendation_reason: str | None = None
    stage: str
    status: ApplicationStatus
    status_label: str
    tags: list[str] = []
    taken_by_name: str | None = None
    created_at: datetime
    submitted_at: datetime | None = None


class QueueCounters(BaseModel):
    new: int = 0
    pipeline: int = 0
    manual: int = 0
    client: int = 0
    decided: int = 0


class BankQueueResponse(BaseModel):
    items: list[BankQueueItem]
    total: int
    counters: QueueCounters


class BankDecisionOut(BaseModel):
    outcome: DecisionOutcome
    outcome_label: str
    amount: int | None = None
    term_months: int | None = None
    rate: float | None = None
    monthly_payment: int | None = None
    requested_documents: list[str] = []
    client_message: str | None = None
    decline_reason: str | None = None
    internal_comment: str | None = None
    decided_by_name: str | None = None
    decided_at: datetime


class BankApplicationDetail(BaseModel):
    id: int
    number: str
    company: CompanyOut
    product: ProductOut
    amount: int
    term_months: int
    purpose: str
    task_code: str | None = None
    needed_by: date | None = None
    repayment_source: str | None = None
    consents: dict[str, Any] = {}
    status: ApplicationStatus
    status_label: str
    labels: list[str] = []
    created_at: datetime
    submitted_at: datetime | None = None
    decided_at: datetime | None = None
    taken_by_name: str | None = None
    documents: list[DocumentOut] = []
    checks: list[SourceCheckOut] = []
    score: ScoreOut | None = None
    rules: list[RuleResultOut] = []
    decision: BankDecisionOut | None = None
    recommendation: str | None = None
    recommendation_reason: str | None = None
    stages: list[StatusStageOut] = []
    history: list[HistoryItemOut] = []


class DecisionRequest(BaseModel):
    outcome: DecisionOutcome
    amount: int | None = Field(default=None, gt=0)
    term_months: int | None = Field(default=None, gt=0, le=360)
    rate: float | None = Field(default=None, gt=0, le=100)
    requested_documents: list[str] = Field(default_factory=list)
    client_message: str | None = Field(default=None, max_length=4000)
    decline_reason: str | None = Field(default=None, max_length=2000)
    internal_comment: str | None = Field(default=None, max_length=4000)


class AuditItemOut(BaseModel):
    id: int
    created_at: datetime
    actor_type: ActorType
    actor_name: str
    action: str
    application_id: int | None = None
    application_number: str | None = None
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None


class AuditList(BaseModel):
    items: list[AuditItemOut]
    total: int


class SourceHealthOut(BaseModel):
    code: str
    name: str
    status: SourceStatus
    avg_response_ms: int | None = None
    errors: int = 0
    last_checked_at: datetime | None = None
    rule: str


class SourceHealthList(BaseModel):
    items: list[SourceHealthOut]


__all__ = [
    "ApplicationDetail",
    "AuditItemOut",
    "AuditList",
    "BankApplicationDetail",
    "BankDecisionOut",
    "BankQueueItem",
    "BankQueueResponse",
    "CompanyOut",
    "DecisionRequest",
    "HistoryItemOut",
    "ProductOut",
    "QueueCounters",
    "ScoreOut",
    "SourceHealthList",
    "SourceHealthOut",
    "StatusStageOut",
]
