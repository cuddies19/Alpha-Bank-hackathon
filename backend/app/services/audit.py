from __future__ import annotations

import re
from datetime import date, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models import ActorType, AuditLog

MASK = "••"
SENSITIVE_KEYS = {
    "passport",
    "passport_number",
    "passport_series",
    "passport_issued_by",
    "phone",
    "phone_number",
    "contact_phone",
    "snils",
}
NON_PERSONAL_KEYS = {
    "application_id",
    "application_number",
    "id",
    "inn",
    "number",
    "ogrn",
    "product_id",
}
LONG_DIGITS_RE = re.compile(r"(?<!\d)\+?\d(?:[\s\-()]*\d){9,11}(?!\d)")


def mask_digits(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) < 6:
        return value
    return f"{digits[:2]} {MASK} {MASK * 2}{digits[-2:]}"


def mask_personal_data(value: Any, key: str | None = None) -> Any:
    """Рекурсивно маскирует паспорт/телефон в before/after журнала аудита."""
    if isinstance(value, dict):
        return {str(k): mask_personal_data(v, str(k)) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [mask_personal_data(item, key) for item in value]
    if isinstance(value, (date, datetime)):
        # JSON-колонки audit_log не умеют сериализовать date/datetime.
        return value.isoformat()
    if isinstance(value, str):
        normalized_key = (key or "").lower()
        if normalized_key in NON_PERSONAL_KEYS:
            return value
        if normalized_key in SENSITIVE_KEYS:
            return mask_digits(value)
        return LONG_DIGITS_RE.sub(lambda match: mask_digits(match.group(0)), value)
    return value


def record(
    db: Session,
    *,
    actor_type: ActorType,
    actor_id: int | None,
    action: str,
    application_id: int | None = None,
    before: dict[str, Any] | None = None,
    after: dict[str, Any] | None = None,
) -> AuditLog:
    entry = AuditLog(
        actor_type=actor_type,
        actor_id=actor_id,
        application_id=application_id,
        action=action,
        before=mask_personal_data(before),
        after=mask_personal_data(after),
    )
    db.add(entry)
    return entry
