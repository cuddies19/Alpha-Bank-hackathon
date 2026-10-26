from __future__ import annotations

import logging
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Application, Company, SourceCheck, SourceStatus
from app.pipeline.settings import pipeline_settings

log = logging.getLogger(__name__)

SOURCE = "statement"
MONTHS = 12


def saved(db: Session, company_id: int) -> dict[str, Any] | None:
    payload = db.scalar(
        select(SourceCheck.response)
        .join(Application, Application.id == SourceCheck.application_id)
        .where(
            Application.company_id == company_id,
            SourceCheck.source == SOURCE,
            SourceCheck.status == SourceStatus.ok,
        )
        .order_by(SourceCheck.checked_at.desc(), SourceCheck.id.desc())
        .limit(1)
    )
    return payload if isinstance(payload, dict) else None


def fetch(inn: str, transport: httpx.BaseTransport | None = None) -> dict[str, Any] | None:
    try:
        with httpx.Client(
            base_url=pipeline_settings.mocks_url,
            timeout=pipeline_settings.source_timeout_s,
            transport=transport,
        ) as client:
            response = client.get(f"/{SOURCE}/{inn}", params={"months": MONTHS})
            response.raise_for_status()
            payload = response.json()
    except Exception as error:
        log.warning("statement for %s is unavailable: %s", inn, error)
        return None
    return payload if isinstance(payload, dict) else None


def load(db: Session, company: Company) -> dict[str, Any] | None:
    return saved(db, company.id) or fetch(company.inn)
