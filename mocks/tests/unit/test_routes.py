import pytest

from app import data as app_data_module
from app import generator


@pytest.mark.smoke
@pytest.mark.positive
def test_health(client, app_data) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == app_data["health"]


@pytest.mark.positive
def test_source_endpoints_return_data_and_latency_header(client, app_data, igor_seed, sleeps) -> None:
    inn = app_data["seeded_inn"]
    egrul = client.get(f"/egrul/{inn}")
    fns = client.get(f"/fns/{inn}")
    bki = client.post("/bki/report", json=app_data["bki_body"])
    statement = client.get(f"/statement/{inn}", params={"months": app_data["months"]})
    for response in (egrul, fns, bki, statement):
        assert response.status_code == 200
        assert response.headers["X-Mock-Latency-Ms"] == "0"
    assert egrul.json()["inn"] == inn
    assert "ogrnip" not in egrul.json()
    assert fns.json()["tax_debt_rub"] == igor_seed["fns"]["tax_debt_rub"]
    assert bki.json()["loans"] == igor_seed["bki"]["loans"]
    assert statement.json()["months"] == app_data_module.statement(inn, app_data["months"])["months"]


@pytest.mark.positive
def test_statement_default_months(client, app_data, sleeps) -> None:
    inn = app_data["unknown_inn"]
    response = client.get(f"/statement/{inn}")
    assert response.json()["months"] == generator.statement(inn, 12)["months"]


@pytest.mark.negative
def test_invalid_inn_rejected(client, app_data, sleeps) -> None:
    for bad in app_data["bad_inns"]:
        assert client.get(f"/egrul/{bad}").status_code == 422
        assert client.get(f"/fns/{bad}").status_code == 422
        assert client.get(f"/statement/{bad}").status_code == 422
    assert client.post("/bki/report", json=app_data["bki_bad_body"]).status_code == 422
    assert client.get(f"/statement/{app_data['seeded_inn']}", params={"months": 0}).status_code == 422
    assert client.get(f"/statement/{app_data['seeded_inn']}", params={"months": 37}).status_code == 422


@pytest.mark.negative
def test_source_in_error_mode_returns_500(client, app_data, sleeps) -> None:
    client.post("/_admin/sources/fns", json={"mode": "error"})
    response = client.get(f"/fns/{app_data['seeded_inn']}")
    assert response.status_code == 500
    assert response.json() == {"detail": app_data["error_detail"]}
    assert response.headers["X-Mock-Latency-Ms"] == "0"


@pytest.mark.positive
def test_admin_listing_set_and_reset(client, app_data) -> None:
    admin = app_data["admin"]
    assert client.get("/_admin/sources").json()["egrul"] == {"mode": "ok", "delay_ms": None}
    response = client.post("/_admin/sources/egrul", json=admin["slow_body"])
    assert response.json() == {"mode": "slow", "delay_ms": 250}
    assert client.get("/_admin/sources").json()["egrul"]["mode"] == "slow"
    assert client.post("/_admin/sources/egrul", json=admin["ok_body"]).json()["delay_ms"] is None
    client.post("/_admin/sources/egrul", json=admin["slow_body"])
    assert client.post("/_admin/sources/_reset").json()["egrul"] == {"mode": "ok", "delay_ms": None}


@pytest.mark.negative
def test_admin_rejects_bad_requests(client, app_data) -> None:
    admin = app_data["admin"]
    assert (
        client.post(f"/_admin/sources/{admin['unknown_source']}", json=admin["slow_body"]).status_code == 404
    )
    assert client.post("/_admin/sources/fns", json=admin["bad_mode_body"]).status_code == 422
    assert client.post("/_admin/sources/fns", json=admin["negative_delay_body"]).status_code == 422
