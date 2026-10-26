"""Clients for the four external sources (contract: docs/integrations.md)."""

import asyncio
import logging
import time
from typing import Any

import httpx

from app.pipeline.texts import attempts_text

log = logging.getLogger(__name__)

SOURCES = ("egrul", "fns", "bki", "statement")

_UNEXPECTED = "Ошибка при запросе к источнику"
TITLES = {"egrul": "ЕГРЮЛ", "fns": "ФНС", "bki": "БКИ", "statement": "Выписка"}

# Subject and verb form for the "did not answer" message.
_NAMES = {
    "egrul": "ЕГРЮЛ не ответил",
    "fns": "ФНС не ответила",
    "bki": "БКИ не ответило",
    "statement": "Выписка не ответила",
}


def unavailable_message(source: str, attempts: int, timeout_s: float) -> str:
    """Text for screen C2, e.g. «БКИ не ответило, 3 попытки по 3 с»."""
    return f"{_NAMES[source]}, {attempts_text(attempts, timeout_s)}"


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
            try:
                result.update(status="ok", payload=response.json(), message=None)
            except ValueError:
                log.error("source %s: answer is not JSON", source)
                result.update(status="error", message=_UNEXPECTED)
            break
        if response is not None and response.status_code < 500:
            # Bad request (e.g. 422): retrying will not help.
            message = f"{TITLES[source]}: некорректный запрос (HTTP {response.status_code})"
            result.update(status="error", message=message)
            break
        if made < attempts:
            await asyncio.sleep(pause_s)
    else:
        result.update(
            status="unavailable", message=unavailable_message(source, attempts, timeout_s)
        )
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
    """Query all sources in parallel. Never raises: _fetch turns any failure into a status."""
    async with httpx.AsyncClient(base_url=mocks_url, transport=transport) as client:
        results = await asyncio.gather(
            *(_fetch(client, s, inn, consent_id, timeout_s, attempts, pause_s) for s in SOURCES)
        )
    return dict(zip(SOURCES, results, strict=True))
