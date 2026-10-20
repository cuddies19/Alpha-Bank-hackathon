from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, Boolean, CheckConstraint, ForeignKey, Index, Integer, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import DateTime


class Base(DeclarativeBase):
    pass


def _timestamp(**kw) -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now(), **kw)


class Application(Base):
    __tablename__ = "applications"
    # Reload server-generated values (updated_at) right after flush.
    __mapper_args__ = {"eager_defaults": True}  # noqa: RUF012
    __table_args__ = (
        CheckConstraint(
            "product in ('overdraft', 'credit_line', 'any_purpose', 'guarantee', 'leasing')",
            name="applications_product_check",
        ),
        Index("applications_status_idx", "status", "id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    inn: Mapped[str] = mapped_column(Text)
    product: Mapped[str] = mapped_column(Text)
    amount_rub: Mapped[int] = mapped_column(BigInteger)
    term_months: Mapped[int] = mapped_column(Integer)
    consent_bki: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    consent_id: Mapped[str | None] = mapped_column(Text)
    # JSONB columns: assign a new list/dict, do not mutate in place (changes would not be saved).
    documents: Mapped[list[Any]] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    status: Mapped[str] = mapped_column(Text, server_default="draft")
    status_label: Mapped[str] = mapped_column(Text, server_default="draft")
    recommendation: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = _timestamp()
    updated_at: Mapped[datetime] = _timestamp(onupdate=func.now())


class StatusHistory(Base):
    __tablename__ = "status_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    from_status: Mapped[str | None] = mapped_column(Text)
    to_status: Mapped[str] = mapped_column(Text)
    reason: Mapped[str | None] = mapped_column(Text)
    meta: Mapped[dict[str, Any]] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = _timestamp()


class SourceCheck(Base):
    __tablename__ = "source_checks"
    __table_args__ = (
        CheckConstraint("status in ('ok', 'unavailable', 'error')", name="source_checks_status_check"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    source: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text)
    attempts: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    payload: Mapped[Any | None] = mapped_column(JSONB)
    message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = _timestamp()


class RuleResult(Base):
    __tablename__ = "rule_results"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"), index=True)
    code: Mapped[str] = mapped_column(Text)
    value: Mapped[str | None] = mapped_column(Text)
    threshold: Mapped[str | None] = mapped_column(Text)
    passed: Mapped[bool] = mapped_column(Boolean)
    created_at: Mapped[datetime] = _timestamp()
