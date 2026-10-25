"""Scoring: DS /score when scoring_url is set, otherwise a fixed stub."""

import asyncio
import logging
from datetime import date
from typing import Any

import httpx

from app.pipeline.texts import attempts_text
from app.rules.dates import months_between

log = logging.getLogger(__name__)

STUB_SCORE = 640
STUB_RISK_CLASS = "B"
RISK_CLASSES = ("A", "B", "C", "D", "E")


def _payload(results: dict[str, dict[str, Any]], source: str) -> dict[str, Any]:
    payload = (results.get(source) or {}).get("payload")
    return payload if isinstance(payload, dict) else {}


def _monthly_payments(loans: Any) -> int | float | None:
    """Sum of loan payments; None if there are no loans data or any payment is unclear."""
    if not isinstance(loans, list):
        return None
    payments = [x.get("monthly_payment_rub") if isinstance(x, dict) else None for x in loans]
    if any(type(p) not in (int, float) for p in payments):
        return None
    return sum(payments)


def build_features(results: dict[str, dict[str, Any]], today: date) -> dict[str, Any]:
    """Features for DS, taken from the source payloads (missing or broken data gives None):
    business_age_months, income_last_year_rub, tax_debt_rub, max_overdue_days_12m,
    max_overdue_days_24m, inquiries_30d, avg_net_flow_rub, marketplace_share,
    revenue_to_other_bank, monthly_payments_rub.
    """
    egrul, fns, bki, statement = (
        _payload(results, s) for s in ("egrul", "fns", "bki", "statement")
    )
    return {
        "business_age_months": months_between(egrul.get("registration_date"), today),
        "income_last_year_rub": fns.get("income_last_year_rub"),
        "tax_debt_rub": fns.get("tax_debt_rub"),
        "max_overdue_days_12m": bki.get("max_overdue_days_12m"),
        "max_overdue_days_24m": bki.get("max_overdue_days_24m"),
        "inquiries_30d": bki.get("inquiries_30d"),
        "avg_net_flow_rub": statement.get("avg_net_flow_rub"),
        "marketplace_share": statement.get("marketplace_share"),
        "revenue_to_other_bank": statement.get("revenue_to_other_bank"),
        "monthly_payments_rub": _monthly_payments(bki.get("loans")),
    }


def _request(inn: str, features: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    """Path and body of the DS call; change here when DS publishes the contract."""
    return "/score", {"inn": inn, "features": features}


def _answer(
    source: str, message: str | None, score: int | None = None, risk_class: str | None = None
):
    status = "unavailable" if score is None else "ok"
    return {
        "status": status,
        "score": score,
        "risk_class": risk_class,
        "source": source,
        "message": message,
    }


def _parse(response: httpx.Response) -> dict[str, Any]:
    """Answer from a 200 response; unavailable if the score or the class makes no sense."""
    try:
        data = response.json()
        score, risk_class = data["score"], data["risk_class"]
    except (ValueError, KeyError, TypeError):
        return _answer("ds", "Скоринг вернул непонятный ответ")
    if type(score) is not int or risk_class not in RISK_CLASSES:
        return _answer("ds", "Скоринг вернул непонятный ответ")
    return _answer("ds", None, score, risk_class)


async def get_score(
    inn: str,
    *,
    results: dict[str, dict[str, Any]],
    scoring_url: str,
    timeout_s: float,
    attempts: int,
    pause_s: float,
    transport: httpx.AsyncBaseTransport | None = None,
    today: date | None = None,
) -> dict[str, Any]:
    """Score for the application. Never raises."""
    if not scoring_url:
        return _answer("stub", None, STUB_SCORE, STUB_RISK_CLASS)
    path, body = _request(inn, build_features(results, today or date.today()))
    async with httpx.AsyncClient(base_url=scoring_url, transport=transport) as client:
        for made in range(1, attempts + 1):
            try:
                response = await client.post(path, json=body, timeout=timeout_s)
            except httpx.HTTPError:
                response = None  # timeout or connection failure: retry
            except Exception:
                log.exception("scoring: unexpected error")
                return _answer("ds", "Ошибка при запросе к скорингу")
            if response is not None and response.status_code == 200:
                return _parse(response)
            if response is not None and response.status_code < 500:
                # Bad request: retrying will not help.
                return _answer("ds", f"Скоринг: некорректный запрос (HTTP {response.status_code})")
            if made < attempts:
                await asyncio.sleep(pause_s)
    return _answer("ds", f"Скоринг не ответил, {attempts_text(attempts, timeout_s)}")
