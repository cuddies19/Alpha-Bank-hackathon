import asyncio
from types import SimpleNamespace

import pytest

from app.pipeline import stages, worker
from tests.source_mocks import load_json
from tests.unit import fakes
from tests.unit.fakes import FakeFactory, FakeStore

SOURCES = ("egrul", "fns", "bki", "statement")


@pytest.fixture
def row(applications):
    """An application-like object built from applications.json."""

    def make(name: str = "igor"):
        return SimpleNamespace(**applications[name])

    return make


@pytest.fixture
def results():
    """Enrich-style results where the given sources have the given status, the rest are ok."""

    def make(statuses: dict[str, str]) -> dict:
        return {
            s: {"source": s, "status": statuses.get(s, "ok"), "attempts": 1, "latency_ms": 5, "payload": {}}
            for s in SOURCES
        }

    return make


@pytest.fixture
def unit() -> dict:
    return load_json("unit")


@pytest.fixture
def run():
    """Run a coroutine to completion (no pytest-asyncio needed)."""
    return asyncio.run


@pytest.fixture
def fake_store(applications):
    """FakeStore with the 'igor' (id 1, complete) and 'no_consent' (id 2, incomplete) applications."""
    return FakeStore(
        apps={1: fakes.row(applications["igor"], 1), 2: fakes.row(applications["no_consent"], 2)}
    )


@pytest.fixture
def factory():
    return FakeFactory()


@pytest.fixture
def stage_store(monkeypatch, fake_store):
    monkeypatch.setattr(stages, "store", fake_store)
    return fake_store


@pytest.fixture
def worker_store(monkeypatch, fake_store):
    monkeypatch.setattr(worker, "store", fake_store)
    return fake_store


@pytest.fixture
def sleeps():
    """A fake sleep that records the pauses instead of waiting."""
    calls: list[float] = []

    async def sleep(seconds: float) -> None:
        calls.append(seconds)

    sleep.calls = calls
    return sleep
