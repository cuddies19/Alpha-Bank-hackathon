"""Clients for the four external sources (contract: docs/integrations.md)."""

import asyncio
import logging
import time
from typing import Any

import httpx

log = logging.getLogger(__name__)

SOURCES = ("egrul", "fns", "bki", "statement")

_UNEXPECTED = "Ошибка при запросе к источнику"
_TITLES = {"egrul": "ЕГРЮЛ", "fns": "ФНС", "bki": "БКИ", "statement": "Выписка"}

# Subject and verb form for the "did not answer" message.
_NAMES = {
    "egrul": "ЕГРЮЛ не ответил",
    "fns": "ФНС не ответила",
    "bki": "БКИ не ответило",
    "statement": "Выписка не ответила",
}


def _attempts_word(n: int) -> str:
    if n % 10 == 1 and n % 100 != 11:
        return "попытка"
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return "попытки"
    return "попыток"


def unavailable_message(source: str, attempts: int, timeout_s: float) -> str:
    """Text for screen C2, e.g. «БКИ не ответило, 3 попытки по 3 с»."""
    return f"{_NAMES[source]}, {attempts} {_attempts_word(attempts)} по {timeout_s:g} с"


def _request(source: str, inn: str, consent_id: str) -> tuple[str, str, dict | None]:
    if source == "bki":
        return "POST", "/bki/report", {"inn": inn, "consent_id": consent_id}
    return "GET", f"/{source}/{inn}", None


async def _fetch(
    client: httpx.AsyncClient,
    source: str,
    inn: str,
    consent_id: str,
    timeout_s: float,
    attempts: int,
    pause_s: float,
) -> dict[str, Any]:
    method, path, body = _request(source, inn, consent_id)
    started = time.monotonic()
    made = 0
    result: dict[str, Any] = {"source": source, "payload": None}
    for made in range(1, attempts + 1):
        try:
            response = await client.request(method, path, json=body, timeout=timeout_s)
        except httpx.HTTPError:
            response = None  # timeout or connection failure: retry
        except Exception:
            log.exception("source %s: unexpected error", source)
            result.update(status="error", message=_UNEXPECTED)
            break
        if response is not None and response.status_code == 200:
            result.update(status="ok", payload=response.json(), message=None)
            break
        if response is not None and response.status_code < 500:
            # Bad request (e.g. 422): retrying will not help.
            message = f"{_TITLES[source]}: некорректный запрос (HTTP {response.status_code})"
            result.update(status="error", message=message)
            break
        if made < attempts:
            await asyncio.sleep(pause_s)
    else:
        result.update(status="unavailable", message=unavailable_message(source, attempts, timeout_s))
    result["attempts"] = made
    result["latency_ms"] = int((time.monotonic() - started) * 1000)
    return result


async def enrich(
    inn: str,
    consent_id: str,
    mocks_url: str,
    timeout_s: float,
    attempts: int,
    pause_s: float,
    transport: httpx.AsyncBaseTransport | None = None,
) -> dict[str, dict[str, Any]]:
    """Query all sources in parallel. Never raises because of a single source."""
    async with httpx.AsyncClient(base_url=mocks_url, transport=transport) as client:
        results = await asyncio.gather(
            *(_fetch(client, s, inn, consent_id, timeout_s, attempts, pause_s) for s in SOURCES),
            return_exceptions=True,
        )
    out: dict[str, dict[str, Any]] = {}
    for source, res in zip(SOURCES, results, strict=True):
        if isinstance(res, BaseException):
            log.error("source %s failed", source, exc_info=res)
            res = {
                "source": source,
                "status": "error",
                "attempts": 0,
                "latency_ms": 0,
                "payload": None,
                "message": _UNEXPECTED,
            }
        out[source] = res
    return out
