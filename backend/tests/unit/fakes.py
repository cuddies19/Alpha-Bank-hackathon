"""Hand-written fakes for unit tests: no DB, no network."""

import asyncio
from contextlib import contextmanager
from dataclasses import dataclass, field
from types import SimpleNamespace
from typing import Any

from app.models import ApplicationStatus


class FakeSession:
    """Enough of sqlalchemy.orm.Session for app.pipeline.store.

    `rows` answers get(); `scalar_rows` is what any select() returns.
    """

    def __init__(
        self, rows: dict[int, Any] | None = None, scalar_rows: list[Any] | None = None
    ) -> None:
        self.rows = rows or {}
        self.scalar_rows = scalar_rows or []
        self.added: list[Any] = []

    def add(self, obj: Any) -> None:
        self.added.append(obj)

    def get(self, model: type, key: int) -> Any:
        return self.rows.get(key)

    def scalars(self, stmt: Any) -> list[Any]:
        return self.scalar_rows


class FakeFactory:
    """Stands in for sessionmaker: begin() yields one FakeSession per transaction."""

    def __init__(self) -> None:
        self.sessions: list[FakeSession] = []

    @contextmanager
    def begin(self):
        session = FakeSession()
        self.sessions.append(session)
        yield session


@dataclass
class Move:
    app_id: int
    to_status: str
    comment: str
    labels: list[str] | None


@dataclass
class FakeStore:
    """Replaces the `store` module inside stages / worker and records what was asked."""

    apps: dict[int, Any] = field(default_factory=dict)
    submitted: list[Any] = field(default_factory=list)
    stuck: list[int] = field(default_factory=list)
    moves: list[Move] = field(default_factory=list)
    checks: list[tuple] = field(default_factory=list)
    scores: list[tuple] = field(default_factory=list)
    recommendations: list[tuple[int, dict]] = field(default_factory=list)
    rule_results: list[tuple[int, list[dict]]] = field(default_factory=list)
    decisions: list[tuple[int, str, dict]] = field(default_factory=list)
    fail_on: set[str] = field(default_factory=set)
    refuse: set[str] = field(default_factory=set)

    def get_application(self, db: Any, app_id: int) -> Any:
        return self.apps.get(app_id)

    def take_submitted(self, db: Any, limit: int) -> list[Any]:
        return self.submitted[:limit]

    def stuck_ids(self, db: Any) -> list[int]:
        return self.stuck

    def move(self, db, app_id, to_status, comment, labels=None) -> bool:
        if to_status in self.fail_on:
            raise RuntimeError(f"cannot move to {to_status}")
        if to_status in self.refuse:
            return False
        self.moves.append(Move(app_id, to_status, comment, labels))
        return True

    def save_source_check(self, db, *args) -> None:
        self.checks.append(args)

    def save_score(self, db, *args) -> None:
        self.scores.append(args)

    def save_rule_results(self, db, app_id, results) -> None:
        self.rule_results.append((app_id, results))

    def save_decision(self, db, app_id, outcome, **fields) -> None:
        self.decisions.append((app_id, outcome, fields))

    def set_recommendation(self, db, app_id, data) -> None:
        self.recommendations.append((app_id, data))

    @property
    def statuses(self) -> list[str]:
        return [m.to_status for m in self.moves]


def row(data: dict, app_id: int = 1, rate: float = 21.5) -> SimpleNamespace:
    """An application-like object built from applications.json."""
    return SimpleNamespace(
        id=app_id,
        number=f"A-{app_id}",
        status=ApplicationStatus.processing,
        amount=data["amount"],
        term_months=data["term_months"],
        consents=data["consents"],
        company=SimpleNamespace(inn=data["inn"]),
        product=SimpleNamespace(code=data["product"], rate=rate),
        documents=[SimpleNamespace(doc_type=d) for d in data["documents"]],
    )


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
