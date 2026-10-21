from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models import (
    ActorType,
    ApplicationStatus,
    DecisionOutcome,
    DocumentStatus,
    NotificationType,
    SourceStatus,
)
from app.schemas.auth import CompanyOut
from app.schemas.products import ProductOut


class ApplicationCreate(BaseModel):
    product_id: int
    amount: int = Field(gt=0)
    term_months: int = Field(gt=0, le=360)
    purpose: str = Field(min_length=1, max_length=5000)
    task_code: str | None = Field(default=None, max_length=64)
    needed_by: date | None = None
    repayment_source: str | None = Field(default=None, max_length=2000)
    consents: dict[str, bool] = Field(default_factory=dict)


class ApplicationUpdate(BaseModel):
    product_id: int | None = None
    amount: int | None = Field(default=None, gt=0)
    term_months: int | None = Field(default=None, gt=0, le=360)
    purpose: str | None = Field(default=None, min_length=1, max_length=5000)
    task_code: str | None = Field(default=None, max_length=64)
    needed_by: date | None = None
    repayment_source: str | None = Field(default=None, max_length=2000)
    consents: dict[str, bool] | None = None


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doc_type: str
    filename: str
    mime_type: str
    size_bytes: int
    status: DocumentStatus
    uploaded_by_id: int
    uploaded_at: datetime


class ClientDecisionOut(BaseModel):
    outcome: DecisionOutcome
    outcome_label: str
    amount: int | None = None
    term_months: int | None = None
    rate: float | None = None
    monthly_payment: int | None = None
    requested_documents: list[str] = []
    client_message: str | None = None
    decline_reason: str | None = None
    decided_at: datetime


class StatusStageOut(BaseModel):
    key: str
    title: str
    status: str
    at: datetime | None = None
    description: str | None = None


class HistoryItemOut(BaseModel):
    from_status: ApplicationStatus
    to_status: ApplicationStatus
    from_label: str
    to_label: str
    actor_type: ActorType
    actor_name: str
    comment: str | None = None
    created_at: datetime


class ApplicationListItem(BaseModel):
    id: int
    number: str
    company_id: int
    company_name: str
    product_id: int
    product_name: str
    amount: int
    term_months: int
    status: ApplicationStatus
    status_label: str
    labels: list[str] = []
    created_at: datetime
    submitted_at: datetime | None = None
    decided_at: datetime | None = None
    taken_by_name: str | None = None


class ApplicationList(BaseModel):
    items: list[ApplicationListItem]
    total: int


class ApplicationDetail(BaseModel):
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
    decision: ClientDecisionOut | None = None
    stages: list[StatusStageOut] = []
    history: list[HistoryItemOut] = []


class WithdrawRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)


class DeclineRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=2000)


class SignRequest(BaseModel):
    code: str | None = Field(default=None, max_length=16)


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int | None = None
    text: str
    type: NotificationType
    read: bool
    created_at: datetime


class NotificationList(BaseModel):
    items: list[NotificationOut]
    unread: int


class LoanScheduleItem(BaseModel):
    number: int
    date: date
    amount: int
    principal: int
    interest: int
    remaining: int


class LoanOut(BaseModel):
    id: int
    application_id: int
    application_number: str
    product_name: str
    amount: int
    term_months: int
    rate: float
    monthly_payment: int
    issued_at: datetime
    schedule: list[LoanScheduleItem] = []


class SourceCheckOut(BaseModel):
    id: int
    source: str
    source_label: str
    status: SourceStatus
    response: dict[str, Any] = {}
    response_time_ms: int
    attempts: int
    checked_at: datetime


class ScoreOut(BaseModel):
    score: int
    risk_class: str
    model_version: str
    factors: list[dict[str, Any]] = []
    created_at: datetime


class RuleResultOut(BaseModel):
    code: str
    value: str
    threshold: str
    passed: bool
    comment: str | None = None
