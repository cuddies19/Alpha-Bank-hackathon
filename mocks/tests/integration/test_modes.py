import pytest
from fastapi.testclient import TestClient

from app.settings import settings


def set_mode(client: TestClient, case: dict):
    return client.post(f"/_admin/sources/{case['source']}", json=case["body"])


@pytest.mark.positive
def test_list_and_set(client: TestClient, data) -> None:
    cases = data("modes")
    listing = client.get("/_admin/sources").json()
    assert listing[cases["listing"]["source"]] == cases["listing"]["expected"]
    r = set_mode(client, cases["set_slow"])
    assert r.json() == {"mode": "slow", "delay_ms": settings.slow_delay_ms}
    r = set_mode(client, cases["set_slow_custom"])
    assert r.json()["delay_ms"] == cases["set_slow_custom"]["delay_ms"]


@pytest.mark.negative
def test_admin_errors(client: TestClient, data) -> None:
    for case in data("modes")["admin_errors"]:
        assert set_mode(client, case).status_code == case["status"]


@pytest.mark.positive
def test_reset_restores_defaults(client: TestClient, reset_defaults, data) -> None:
    cases = data("modes")["reset"]
    set_mode(client, cases["changed"])
    state = client.post("/_admin/sources/_reset").json()
    assert state["bki"]["mode"] == cases["expected_modes"]["bki"]
    assert state[cases["slow_source"]] == {"mode": "slow", "delay_ms": settings.slow_delay_ms}
    assert state["egrul"]["mode"] == cases["expected_modes"]["egrul"]


@pytest.mark.positive
def test_ok_reports_latency_header(client: TestClient, sleeps, jitter, igor, data) -> None:
    expected = data("modes")["jitter"]
    r = client.post("/bki/report", json=igor["bki_request"])
    assert r.status_code == 200
    assert r.headers["X-Mock-Latency-Ms"] == expected["header"]
    assert sleeps == [expected["sleep_s"]]


@pytest.mark.positive
def test_slow_adds_delay(client: TestClient, sleeps, igor, data) -> None:
    case = data("modes")["set_slow_statement"]
    set_mode(client, case)
    r = client.get(f"/statement/{igor['inn']}")
    assert r.status_code == 200
    assert r.headers["X-Mock-Latency-Ms"] == case["latency_header"]
    assert sleeps == [case["delay_s"]]


@pytest.mark.smoke
@pytest.mark.negative
def test_down_hangs(client: TestClient, sleeps, igor, data) -> None:
    set_mode(client, data("modes")["set_down"])
    client.post("/bki/report", json=igor["bki_request"])  # sleep is patched, so it returns at once
    assert sleeps[-1] == settings.down_hang_s


@pytest.mark.negative
def test_error_then_back_to_ok(client: TestClient, sleeps, igor, data) -> None:
    cases = data("modes")
    set_mode(client, cases["set_error"])
    r = client.post("/bki/report", json=igor["bki_request"])
    assert r.status_code == cases["error_response"]["status"]
    assert r.json() == cases["error_response"]["detail"]
    assert cases["error_response"]["latency_header"] in r.headers
    set_mode(client, cases["set_ok"])
    assert client.post("/bki/report", json=igor["bki_request"]).status_code == 200
