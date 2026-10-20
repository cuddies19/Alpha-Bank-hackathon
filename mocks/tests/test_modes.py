import pytest
from fastapi.testclient import TestClient

from app import modes
from app.settings import settings

IGOR = "7701234567"
BKI = {"inn": IGOR, "consent_id": "c1"}


@pytest.fixture
def sleeps(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    calls: list[float] = []

    async def fake_sleep(seconds: float) -> None:
        calls.append(seconds)

    monkeypatch.setattr(modes.asyncio, "sleep", fake_sleep)
    return calls


@pytest.mark.small
def test_parse_modes() -> None:
    assert modes.parse_modes("bki=down, fns=slow") == {"bki": "down", "fns": "slow"}
    assert modes.parse_modes("") == {}
    with pytest.raises(ValueError):
        modes.parse_modes("bki=broken")
    with pytest.raises(ValueError):
        modes.parse_modes("nope=down")


@pytest.mark.medium
def test_list_and_set(client: TestClient) -> None:
    listing = client.get("/_admin/sources").json()
    assert listing["egrul"] == {"mode": "ok", "delay_ms": None}
    r = client.post("/_admin/sources/fns", json={"mode": "slow"})
    assert r.json() == {"mode": "slow", "delay_ms": settings.slow_delay_ms}
    r = client.post("/_admin/sources/fns", json={"mode": "slow", "delay_ms": 5000})
    assert r.json()["delay_ms"] == 5000


@pytest.mark.medium
def test_admin_errors(client: TestClient) -> None:
    assert client.post("/_admin/sources/nope", json={"mode": "ok"}).status_code == 404
    assert client.post("/_admin/sources/bki", json={"mode": "weird"}).status_code == 422
    assert client.post("/_admin/sources/bki", json={"mode": "slow", "delay_ms": -1}).status_code == 422


@pytest.mark.medium
def test_reset_restores_defaults(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "default_modes", "bki=down,fns=slow")
    client.post("/_admin/sources/egrul", json={"mode": "error"})
    state = client.post("/_admin/sources/_reset").json()
    assert state["bki"]["mode"] == "down"
    assert state["fns"] == {"mode": "slow", "delay_ms": settings.slow_delay_ms}
    assert state["egrul"]["mode"] == "ok"


@pytest.mark.medium
def test_ok_reports_latency_header(
    client: TestClient, sleeps: list[float], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "jitter_min_ms", 250)
    monkeypatch.setattr(settings, "jitter_max_ms", 250)
    r = client.post("/bki/report", json=BKI)
    assert r.status_code == 200
    assert r.headers["X-Mock-Latency-Ms"] == "250"
    assert sleeps == [0.25]


@pytest.mark.medium
def test_slow_adds_delay(client: TestClient, sleeps: list[float]) -> None:
    client.post("/_admin/sources/statement", json={"mode": "slow", "delay_ms": 5000})
    r = client.get(f"/statement/{IGOR}")
    assert r.status_code == 200
    assert r.headers["X-Mock-Latency-Ms"] == "5000"
    assert sleeps == [5.0]


@pytest.mark.medium
def test_down_hangs(client: TestClient, sleeps: list[float]) -> None:
    client.post("/_admin/sources/bki", json={"mode": "down"})
    client.post("/bki/report", json=BKI)  # sleep is patched, so it returns at once
    assert sleeps[-1] == settings.down_hang_s


@pytest.mark.medium
def test_error_then_back_to_ok(client: TestClient, sleeps: list[float]) -> None:
    client.post("/_admin/sources/bki", json={"mode": "error"})
    r = client.post("/bki/report", json=BKI)
    assert r.status_code == 500 and r.json() == {"detail": "source error"}
    assert "X-Mock-Latency-Ms" in r.headers
    client.post("/_admin/sources/bki", json={"mode": "ok"})
    assert client.post("/bki/report", json=BKI).status_code == 200
