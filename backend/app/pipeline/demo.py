"""Demo controls: source modes live in the mocks admin, speed in a one-row table the worker reads."""

import httpx
from sqlalchemy import Float, Integer
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.models.base import Base

TIMEOUT_S = 2
SOURCES = ("egrul", "fns", "bki", "statement")
UNAVAILABLE = "unavailable"

# Core status -> mock mode
MODES = {"ok": "ok", "warn": "slow", "fail": "error", "unavailable": "down"}
STATUSES = {mode: status for status, mode in MODES.items()}


class MocksUnavailable(Exception):
    pass


class DemoSettings(Base):
    __tablename__ = "demo_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    speed_multiplier: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)


class MocksAdmin:
    """Sync client of the mocks admin API (`/_admin/sources`)."""

    def __init__(self, url: str, transport: httpx.BaseTransport | None = None) -> None:
        self.url = url.rstrip("/") + "/_admin/sources"
        self.transport = transport

    def _call(self, method: str, path: str = "", body: dict | None = None) -> dict:
        try:
            with httpx.Client(timeout=TIMEOUT_S, transport=self.transport) as client:
                response = client.request(method, self.url + path, json=body)
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError) as e:
            raise MocksUnavailable(str(e)) from e

    def statuses(self) -> dict[str, str]:
        """Core status per source; all `unavailable` when the mocks do not answer."""
        try:
            modes = self._call("GET")
        except MocksUnavailable:
            return dict.fromkeys(SOURCES, UNAVAILABLE)
        return {s: STATUSES.get(modes.get(s, {}).get("mode"), UNAVAILABLE) for s in SOURCES}

    def set_status(self, source: str, status: str, latency_ms: int | None) -> None:
        delay_ms = latency_ms if status == "warn" else None
        self._call("POST", f"/{source}", {"mode": MODES[status], "delay_ms": delay_ms})

    def reset(self) -> None:
        self._call("POST", "/_reset")


def get_speed(db: Session) -> float:
    row = db.get(DemoSettings, 1)
    # a hand-edited 0 or negative value would break the worker's division
    return row.speed_multiplier if row and row.speed_multiplier > 0 else 1.0


def set_speed(db: Session, multiplier: float) -> None:
    row = db.get(DemoSettings, 1)
    if row is None:
        db.add(DemoSettings(id=1, speed_multiplier=multiplier))
    else:
        row.speed_multiplier = multiplier
