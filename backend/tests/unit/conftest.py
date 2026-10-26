import asyncio
from datetime import date
from pathlib import Path

import pytest
import yaml

from app.pipeline import stages, worker
from app.rules.engine import evaluate, load_rules
from tests.source_mocks import load_json
from tests.unit import fakes
from tests.unit.fakes import FakeFactory, FakeStore

SOURCES = ("egrul", "fns", "bki", "statement")
TODAY = date(2026, 10, 20)


@pytest.fixture
def row(applications, unit):
    """An application-like object built from applications.json."""

    def make(name: str = "igor", app_id: int = 1):
        data = applications[name]
        return fakes.row(data, app_id, unit["product_rates"][data["product"]])

    return make


@pytest.fixture
def results():
    """Enrich-style results where the given sources have the given status, the rest are ok."""

    def make(statuses: dict[str, str]) -> dict:
        return {
            s: {
                "source": s,
                "status": statuses.get(s, "ok"),
                "attempts": 1,
                "latency_ms": 5,
                "payload": {},
            }
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
def fake_store(row):
    """FakeStore with the 'igor' (id 1, complete) and 'no_consent' (id 2, incomplete) applications."""
    return FakeStore(apps={1: row("igor", 1), 2: row("no_consent", 2)})


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


def _set_path(data: dict, path: str, value) -> None:
    *parents, last = path.split(".")
    for key in parents:
        data = data[key]
    data[last] = value


@pytest.fixture
def rules_file(tmp_path):
    """Write a copy of rules.yaml with changed rule fields, return its path."""

    def make(changes: dict) -> Path:
        rules = load_rules()
        by_code = {r["code"]: r for r in rules["rules"]}
        for path, value in changes.items():
            code, field = path.split(".", 1)
            by_code[code][field] = value
        out = tmp_path / "rules.yaml"
        out.write_text(yaml.safe_dump(rules, allow_unicode=True), encoding="utf-8")
        return out

    return make


@pytest.fixture
def decide(rules_file):
    """evaluate() for a seed client (rules_<name>.json), optionally changed by a named patch."""

    def run(name: str, patch: str | None = None):
        case = load_json(f"rules_{name}")
        rule_changes = {}
        for path, value in load_json("rules_patches").get(patch, {}).items():
            if path.startswith("rules."):
                rule_changes[path.removeprefix("rules.")] = value
            else:
                _set_path(case, path, value)
        rules = load_rules(rules_file(rule_changes))
        return evaluate(case["application"], case["sources"], case["score"], rules, TODAY)

    return run
