from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, enum_column, utcnow
from app.models.enums import (
    ActorType,
    ApplicationStatus,
    CompanyType,
    DecisionOutcome,
    DocumentStatus,
    NotificationType,
    SourceStatus,
    UserRole,
)


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    inn: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    ogrn: Mapped[str] = mapped_column(String(15))
    type: Mapped[CompanyType] = mapped_column(enum_column(CompanyType, length=16))
    name: Mapped[str] = mapped_column(String(255))
    registration_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    okved: Mapped[str | None] = mapped_column(String(16), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    director: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    users: Mapped[list[User]] = relationship(back_populates="company")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(enum_column(UserRole, length=16))
    full_name: Mapped[str] = mapped_column(String(255))
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    company: Mapped[Company | None] = relationship(back_populates="users")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    min_amount: Mapped[int] = mapped_column(BigInteger)
    max_amount: Mapped[int] = mapped_column(BigInteger)
    min_term_months: Mapped[int] = mapped_column(Integer)
    max_term_months: Mapped[int] = mapped_column(Integer)
    rate: Mapped[float] = mapped_column(Float)
    requires_collateral: Mapped[bool] = mapped_column(Boolean, default=False)
    decision_time: Mapped[str | None] = mapped_column(String(64), nullable=True)
    features: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (Index("ix_applications_company_status", "company_id", "status"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    amount: Mapped[int] = mapped_column(BigInteger)
    term_months: Mapped[int] = mapped_column(Integer)
    purpose: Mapped[str] = mapped_column(Text)
    task_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    needed_by: Mapped[date | None] = mapped_column(Date, nullable=True)
    repayment_source: Mapped[str | None] = mapped_column(Text, nullable=True)
    consents: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[ApplicationStatus] = mapped_column(
        enum_column(ApplicationStatus, length=32),
        default=ApplicationStatus.draft,
        index=True,
    )
    labels: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    taken_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    company: Mapped[Company] = relationship()
    product: Mapped[Product] = relationship()
    created_by: Mapped[User] = relationship(foreign_keys=[created_by_id])
    taken_by: Mapped[User | None] = relationship(foreign_keys=[taken_by_id])
    documents: Mapped[list[Document]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    source_checks: Mapped[list[SourceCheck]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    scores: Mapped[list[Score]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    rule_results: Mapped[list[RuleResult]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    decisions: Mapped[list[Decision]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    history: Mapped[list[StatusHistory]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="StatusHistory.created_at",
    )
    loan: Mapped[Loan | None] = relationship(back_populates="application", uselist=False)

    @property
    def latest_decision(self) -> Decision | None:
        return max(self.decisions, key=lambda item: item.decided_at, default=None)

    @property
    def current_decision(self) -> Decision | None:
        decision = self.latest_decision
        if decision is None:
            return None
        if self.submitted_at and decision.decided_at < self.submitted_at:
            return None
        return decision

    @property
    def latest_score(self) -> Score | None:
        return max(self.scores, key=lambda item: item.created_at, default=None)

    @property
    def latest_checks(self) -> list[SourceCheck]:
        latest: dict[str, SourceCheck] = {}
        for check in self.source_checks:
            current = latest.get(check.source)
            if current is None or check.checked_at > current.checked_at:
                latest[check.source] = check
        return list(latest.values())


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    doc_type: Mapped[str] = mapped_column(String(64))
    filename: Mapped[str] = mapped_column(String(255))
    path: Mapped[str] = mapped_column(String(500))
    mime_type: Mapped[str] = mapped_column(String(128))
    size_bytes: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[DocumentStatus] = mapped_column(
        enum_column(DocumentStatus, length=16), default=DocumentStatus.uploaded
    )
    uploaded_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="documents")
    uploaded_by: Mapped[User] = relationship()


class SourceCheck(Base):
    __tablename__ = "source_checks"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    source: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[SourceStatus] = mapped_column(enum_column(SourceStatus, length=16))
    response: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    response_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    attempts: Mapped[int] = mapped_column(Integer, default=1)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="source_checks")


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    score: Mapped[int] = mapped_column(Integer)
    risk_class: Mapped[str] = mapped_column(String(1))
    model_version: Mapped[str] = mapped_column(String(32))
    factors: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="scores")


class RuleResult(Base):
    __tablename__ = "rule_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(64))
    value: Mapped[str] = mapped_column(String(255))
    threshold: Mapped[str] = mapped_column(String(255))
    passed: Mapped[bool] = mapped_column(Boolean)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="rule_results")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    outcome: Mapped[DecisionOutcome] = mapped_column(enum_column(DecisionOutcome, length=16))
    amount: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    term_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    monthly_payment: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    requested_documents: Mapped[list[str]] = mapped_column(JSON, default=list)
    client_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    decline_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    internal_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="decisions")
    decided_by: Mapped[User | None] = relationship()


class StatusHistory(Base):
    __tablename__ = "status_history"
    __table_args__ = (
        Index("ix_status_history_application_created", "application_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), index=True
    )
    from_status: Mapped[ApplicationStatus] = mapped_column(
        enum_column(ApplicationStatus, length=32)
    )
    to_status: Mapped[ApplicationStatus] = mapped_column(enum_column(ApplicationStatus, length=32))
    actor_type: Mapped[ActorType] = mapped_column(enum_column(ActorType, length=16))
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="history")
    actor: Mapped[User | None] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = (Index("ix_audit_log_application_created", "application_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    actor_type: Mapped[ActorType] = mapped_column(enum_column(ActorType, length=16))
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    application_id: Mapped[int | None] = mapped_column(
        ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(64), index=True)
    before: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    after: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    actor: Mapped[User | None] = relationship()


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (Index("ix_notifications_user_read", "user_id", "read"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    application_id: Mapped[int | None] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True
    )
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[NotificationType] = mapped_column(enum_column(NotificationType, length=24))
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application | None] = relationship()


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), unique=True
    )
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    amount: Mapped[int] = mapped_column(BigInteger)
    term_months: Mapped[int] = mapped_column(Integer)
    rate: Mapped[float] = mapped_column(Float)
    monthly_payment: Mapped[int] = mapped_column(BigInteger)
    schedule: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    application: Mapped[Application] = relationship(back_populates="loan")
    company: Mapped[Company] = relationship()
