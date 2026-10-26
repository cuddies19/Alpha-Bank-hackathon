import json
from collections.abc import Callable
from pathlib import Path

import pytest

from app import modes
from app.settings import settings

DATA_DIR = Path(__file__).parent / "test_data"
OUTCOME_MARKERS = {"positive", "negative"}


def read_data(name: str):
    return json.loads((DATA_DIR / f"{name}.json").read_text(encoding="utf-8"))


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    # every test needs exactly one of positive / negative
    bad = [item.nodeid for item in items if len(OUTCOME_MARKERS & {m.name for m in item.iter_markers()}) != 1]
    if bad:
        raise pytest.UsageError("tests need exactly one of positive/negative: " + ", ".join(bad))


@pytest.fixture
def data() -> Callable[[str], object]:
    """Load tests/test_data/<name>.json."""
    return read_data


@pytest.fixture
def igor(data) -> dict:
    return data("igor")


@pytest.fixture(autouse=True)
def fast_mocks(monkeypatch: pytest.MonkeyPatch):
    """No jitter, no default modes, clean state for every test."""
    monkeypatch.setattr(settings, "jitter_min_ms", 0)
    monkeypatch.setattr(settings, "jitter_max_ms", 0)
    monkeypatch.setattr(settings, "default_modes", "")
    modes.reset()
    yield
    modes.reset()
