import json
from pathlib import Path

import pytest

from tests.conftest import read_data

SEEDS_DIR = Path(__file__).resolve().parents[2] / "seeds"
SEED_FILES = sorted(SEEDS_DIR.glob("*.json"))


@pytest.fixture(params=read_data("generator")["inns"])
def generator_inn(request) -> str:
    return request.param


@pytest.fixture
def seed_files() -> list[Path]:
    return SEED_FILES


@pytest.fixture(params=SEED_FILES, ids=lambda p: p.stem)
def seed_path(request) -> Path:
    return request.param


@pytest.fixture
def seed(seed_path: Path) -> dict:
    return json.loads(seed_path.read_text(encoding="utf-8"))


@pytest.fixture
def igor_seed(data) -> dict:
    name = data("seeds")["igor"]["file"]
    return json.loads((SEEDS_DIR / name).read_text(encoding="utf-8"))


@pytest.fixture
def app_data(data) -> dict:
    return data("unit_app")


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sleeps(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    """Replace asyncio.sleep in app.modes with a recorder; nothing really waits."""
    from app import modes

    recorded: list[float] = []

    async def fake_sleep(seconds: float) -> None:
        recorded.append(seconds)

    monkeypatch.setattr(modes.asyncio, "sleep", fake_sleep)
    return recorded


@pytest.fixture
def fixed_jitter(monkeypatch: pytest.MonkeyPatch, app_data) -> int:
    from app.settings import settings

    monkeypatch.setattr(settings, "jitter_min_ms", app_data["jitter_ms"])
    monkeypatch.setattr(settings, "jitter_max_ms", app_data["jitter_ms"])
    monkeypatch.setattr(settings, "down_hang_s", app_data["down_hang_s"])
    return app_data["jitter_ms"]
