import time

import httpx
import pytest
from fastapi.testclient import TestClient

from tests.integration.test_modes import set_mode


@pytest.mark.smoke
@pytest.mark.positive
def test_igor_egrul(client: TestClient, igor) -> None:
    body = client.get(f"/egrul/{igor['inn']}").json()
    for key, value in igor["egrul"].items():
        assert body[key] == value


@pytest.mark.smoke
@pytest.mark.positive
def test_igor_fns(client: TestClient, igor) -> None:
    body = client.get(f"/fns/{igor['inn']}").json()
    for key, value in igor["fns"].items():
        assert body[key] == value


@pytest.mark.smoke
@pytest.mark.positive
def test_igor_bki(client: TestClient, igor) -> None:
    resp = client.post("/bki/report", json=igor["bki_request"])
    assert resp.status_code == 200
    body = resp.json()
    expected = igor["bki"]
    assert len(body["loans"]) == expected["loans_count"]
    assert {k: body["loans"][0][k] for k in expected["loan"]} == expected["loan"]
    assert body["max_overdue_days_12m"] == expected["max_overdue_days_12m"]
    assert body["max_overdue_days_24m"] == expected["max_overdue_days_24m"]
    assert body["inquiries_30d"] == expected["inquiries_30d"]


@pytest.mark.smoke
@pytest.mark.positive
def test_igor_statement(client: TestClient, igor) -> None:
    body = client.get(f"/statement/{igor['inn']}").json()
    expected = igor["statement"]
    for key, value in expected.items():
        if key != "months_count":
            assert body[key] == value
    assert len(body["months"]) == expected["months_count"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in body["months"]]
    assert sum(nets) // expected["months_count"] == expected["avg_net_flow_rub"]


@pytest.mark.positive
def test_unknown_inn_is_stable(client: TestClient, stable_case: dict, data) -> None:
    inn = stable_case["inn"]
    body = {"inn": inn, "consent_id": data("sources")["consent_id"]}

    def snapshot():
        return (
            client.get(f"/egrul/{inn}").json(),
            client.get(f"/fns/{inn}").json(),
            client.post("/bki/report", json=body).json(),
            client.get(f"/statement/{inn}").json(),
        )

    first = snapshot()
    assert all(part for part in first)
    assert snapshot() == first
    assert snapshot() == first


@pytest.mark.negative
def test_error_mode_returns_500_and_reset_restores(client: TestClient, igor, data) -> None:
    case = data("modes")["error_fns"]
    assert set_mode(client, case).status_code == 200
    resp = client.get(f"/fns/{igor['inn']}")
    assert resp.status_code == 500
    assert resp.json() == case["detail"]
    assert client.get(f"/egrul/{igor['inn']}").status_code == 200

    assert client.post("/_admin/sources/_reset").status_code == 200
    assert client.get(f"/fns/{igor['inn']}").status_code == 200
    assert all(v["mode"] == "ok" for v in client.get("/_admin/sources").json().values())


@pytest.mark.smoke
@pytest.mark.negative
def test_down_source_times_out_and_reset_recovers(live_server: str, igor, data) -> None:
    cases = data("modes")
    live = cases["live"]
    with httpx.Client(base_url=live_server, timeout=live["client_timeout_s"]) as http:
        assert http.get("/health").json() == data("health")["expected"]
        assert set_mode(http, cases["set_down"]).status_code == 200

        started = time.monotonic()
        with pytest.raises(httpx.TimeoutException):
            http.post("/bki/report", json=igor["bki_request"])
        assert time.monotonic() - started < live["max_wait_s"]

        assert http.get(f"/egrul/{igor['inn']}").status_code == 200
        assert http.post("/_admin/sources/_reset").status_code == 200
        ok = http.post("/bki/report", json=igor["bki_request"])
        assert ok.status_code == 200
