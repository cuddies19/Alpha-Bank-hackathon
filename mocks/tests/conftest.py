import pytest
from fastapi.testclient import TestClient

from app import modes
from app.main import app
from app.settings import settings


@pytest.fixture(autouse=True)
def fast_mocks(monkeypatch: pytest.MonkeyPatch):
    """No jitter, no default modes, clean state for every test."""
    monkeypatch.setattr(settings, "jitter_min_ms", 0)
    monkeypatch.setattr(settings, "jitter_max_ms", 0)
    monkeypatch.setattr(settings, "default_modes", "")
    modes.reset()
    yield
    modes.reset()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
