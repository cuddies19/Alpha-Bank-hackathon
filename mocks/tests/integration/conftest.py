import socket
import threading
import time

import pytest
import uvicorn
from fastapi.testclient import TestClient

from app import modes
from app.main import app
from app.settings import settings
from tests.conftest import read_data


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def sleeps(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    """Replace the mock's sleep; returns the list of requested delays."""
    calls: list[float] = []

    async def fake_sleep(seconds: float) -> None:
        calls.append(seconds)

    monkeypatch.setattr(modes.asyncio, "sleep", fake_sleep)
    return calls


@pytest.fixture
def jitter(monkeypatch: pytest.MonkeyPatch, data) -> None:
    ms = data("modes")["jitter"]["ms"]
    monkeypatch.setattr(settings, "jitter_min_ms", ms)
    monkeypatch.setattr(settings, "jitter_max_ms", ms)


@pytest.fixture
def reset_defaults(monkeypatch: pytest.MonkeyPatch, data) -> None:
    monkeypatch.setattr(settings, "default_modes", data("modes")["reset"]["default_modes"])


@pytest.fixture(params=read_data("sources")["unknown"], ids=lambda c: c["inn"])
def unknown_case(request) -> dict:
    return request.param


@pytest.fixture(params=read_data("sources")["stable"], ids=lambda c: c["inn"])
def stable_case(request) -> dict:
    return request.param


@pytest.fixture(params=read_data("sources")["bad_inns"])
def bad_inn(request) -> str:
    return request.param


@pytest.fixture
def live_server(monkeypatch: pytest.MonkeyPatch, data):
    """Real uvicorn on a free port; stopped on teardown."""
    monkeypatch.setattr(settings, "down_hang_s", data("modes")["live"]["down_hang_s"])
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    config = uvicorn.Config(
        app, host="127.0.0.1", port=port, log_level="warning", timeout_graceful_shutdown=1
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    deadline = time.monotonic() + 5
    while not server.started and time.monotonic() < deadline:
        time.sleep(0.01)
    assert server.started, "server did not start"
    yield f"http://127.0.0.1:{port}"
    server.should_exit = True
    thread.join(timeout=5)
    assert not thread.is_alive()
