import socket
import threading
import time

import httpx
import pytest
import uvicorn

from app.main import app
from app.settings import settings

IGOR = "7701234567"


@pytest.fixture
def live_server(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "down_hang_s", 2)
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


@pytest.mark.medium
def test_igor_egrul(client):
    body = client.get(f"/egrul/{IGOR}").json()
    assert body["inn"] == IGOR
    assert body["entity_type"] == "ul"
    assert body["status"] == "active"
    assert body["registration_date"] == "2024-06-12"
    assert body["okved"] == "47.91"
    assert body["head_name"] == "Соколов И. А."


@pytest.mark.medium
def test_igor_fns(client):
    body = client.get(f"/fns/{IGOR}").json()
    assert body["tax_debt_rub"] == 0
    assert body["address_unreliable"] is False
    assert body["income_last_year_rub"] == 44_800_000
    assert body["expenses_last_year_rub"] == 41_900_000
    assert body["avg_headcount"] == 6


@pytest.mark.medium
def test_igor_bki(client):
    resp = client.post("/bki/report", json={"inn": IGOR, "consent_id": "cns-1"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["loans"] == [
        {"bank": body["loans"][0]["bank"], "balance_rub": 450_000, "monthly_payment_rub": 38_000}
    ]
    assert body["max_overdue_days_12m"] == 0
    assert body["max_overdue_days_24m"] == 0
    assert body["inquiries_30d"] == 2


@pytest.mark.medium
def test_igor_statement(client):
    body = client.get(f"/statement/{IGOR}").json()
    assert body["avg_net_flow_rub"] == 610_000
    assert body["balance_rub"] == 1_240_500
    assert body["inflow_30d_rub"] == 3_860_000
    assert body["marketplace_share"] == 0.85
    assert body["revenue_to_other_bank"] is False
    assert len(body["months"]) == 12
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in body["months"]]
    assert sum(nets) // 12 == 610_000


@pytest.mark.medium
@pytest.mark.parametrize("inn", ["7799000011", "779900001122"])
def test_unknown_inn_is_stable(client, inn):
    def snapshot():
        return (
            client.get(f"/egrul/{inn}").json(),
            client.get(f"/fns/{inn}").json(),
            client.post("/bki/report", json={"inn": inn, "consent_id": "c"}).json(),
            client.get(f"/statement/{inn}").json(),
        )

    first = snapshot()
    assert all(part for part in first)
    assert snapshot() == first
    assert snapshot() == first


@pytest.mark.medium
def test_error_mode_returns_500_and_reset_restores(client):
    assert client.post("/_admin/sources/fns", json={"mode": "error"}).status_code == 200
    resp = client.get(f"/fns/{IGOR}")
    assert resp.status_code == 500
    assert resp.json() == {"detail": "source error"}
    assert client.get(f"/egrul/{IGOR}").status_code == 200

    assert client.post("/_admin/sources/_reset").status_code == 200
    assert client.get(f"/fns/{IGOR}").status_code == 200
    assert all(v["mode"] == "ok" for v in client.get("/_admin/sources").json().values())


@pytest.mark.large
def test_down_source_times_out_and_reset_recovers(live_server):
    with httpx.Client(base_url=live_server, timeout=1.0) as http:
        assert http.get("/health").json() == {"status": "ok"}
        resp = http.post("/_admin/sources/bki", json={"mode": "down"})
        assert resp.status_code == 200

        started = time.monotonic()
        with pytest.raises(httpx.TimeoutException):
            http.post("/bki/report", json={"inn": IGOR, "consent_id": "c"})
        assert time.monotonic() - started < 1.9

        assert http.get(f"/egrul/{IGOR}").status_code == 200
        assert http.post("/_admin/sources/_reset").status_code == 200
        ok = http.post("/bki/report", json={"inn": IGOR, "consent_id": "c"})
        assert ok.status_code == 200
