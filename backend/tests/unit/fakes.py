"""Hand-written fakes for unit tests: no DB, no network."""

import asyncio
from contextlib import contextmanager
from dataclasses import dataclass, field
from types import SimpleNamespace
from typing import Any

from app.db.models import Application


class FakeScalars:
    def __init__(self, rows: list[Any]) -> None:
        self.rows = rows

    def __iter__(self):
        return iter(self.rows)

    def one_or_none(self):
        return self.rows[0] if self.rows else None


class FakeSession:
    """Enough of sqlalchemy.orm.Session for app.db.store.

    `rows` answers get(); `scalar_rows` is what any select() returns.
    """

    def __init__(self, rows: dict[int, Any] | None = None, scalar_rows: list[Any] | None = None) -> None:
        self.rows = rows or {}
        self.scalar_rows = scalar_rows or []
        self.added: list[Any] = []
        self.flushes = 0
        self.refreshed: list[Any] = []

    def add(self, obj: Any) -> None:
        self.added.append(obj)

    def flush(self) -> None:
        self.flushes += 1

    def refresh(self, obj: Any) -> None:
        self.refreshed.append(obj)

    def get(self, model: type, key: int) -> Any:
        return self.rows.get(key)

    def scalars(self, stmt: Any) -> FakeScalars:
        return FakeScalars(self.scalar_rows)


class FakeFactory:
    """Stands in for sessionmaker: begin() yields one FakeSession per transaction."""

    def __init__(self, scalar_rows: list[Any] | None = None) -> None:
        self.scalar_rows = scalar_rows or []
        self.sessions: list[FakeSession] = []

    @contextmanager
    def begin(self):
        session = FakeSession(scalar_rows=self.scalar_rows)
        self.sessions.append(session)
        yield session


@dataclass
class StatusChange:
    app_id: int
    to_status: str
    reason: str | None
    meta: dict | None
    label: str | None


@dataclass
class FakeStore:
    """Replaces the `store` module inside stages / worker and records what was asked."""

    apps: dict[int, Any] = field(default_factory=dict)
    submitted: list[Any] = field(default_factory=list)
    changes: list[StatusChange] = field(default_factory=list)
    checks: list[tuple] = field(default_factory=list)
    recommendations: list[tuple[int, dict]] = field(default_factory=list)
    fail_on: set[str] = field(default_factory=set)

    def get_application(self, session: Any, app_id: int) -> Any:
        return self.apps.get(app_id)

    def take_submitted(self, session: Any, limit: int) -> list[Any]:
        return self.submitted[:limit]

    def change_status(self, session, app_id, to_status, reason, meta=None, label=None) -> None:
        if to_status in self.fail_on:
            raise RuntimeError(f"cannot change to {to_status}")
        self.changes.append(StatusChange(app_id, to_status, reason, meta, label))

    def save_source_check(self, session, *args) -> None:
        self.checks.append(args)

    def save_recommendation(self, session, app_id, data) -> None:
        self.recommendations.append((app_id, data))

    @property
    def statuses(self) -> list[str]:
        return [c.to_status for c in self.changes]


def application(data: dict) -> Application:
    """A transient (never persisted) Application."""
    return Application(**data)


def row(data: dict, app_id: int = 1) -> SimpleNamespace:
    return SimpleNamespace(id=app_id, **data)


class FakeConnection:
    """Fake psycopg.AsyncConnection: `notifies` are delivered, then the stream hangs or ends."""

    def __init__(self, notifies: int = 0, then: str = "hang") -> None:
        self.pending = notifies
        self.then = then
        self.executed: list[str] = []
        self.closed = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc) -> None:
        self.closed = True

    async def execute(self, sql: str) -> None:
        self.executed.append(sql)

    async def notifies(self):
        for _ in range(self.pending):
            yield object()
        if self.then == "hang":
            await asyncio.Event().wait()
        elif self.then == "break":
            raise OSError("connection reset")
