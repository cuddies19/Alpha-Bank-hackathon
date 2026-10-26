import pytest
from fastapi.testclient import TestClient


def bki_body(inn: str, data) -> dict:
    return {"inn": inn, "consent_id": data("sources")["consent_id"]}


def fetch_all(client: TestClient, inn: str, data) -> list:
    return [
        client.get(f"/egrul/{inn}").json(),
        client.get(f"/fns/{inn}").json(),
        client.post("/bki/report", json=bki_body(inn, data)).json(),
        client.get(f"/statement/{inn}").json(),
    ]


@pytest.mark.smoke
@pytest.mark.positive
def test_igor_all_sources(client: TestClient, igor, data) -> None:
    inn = igor["inn"]
    egrul = client.get(f"/egrul/{inn}").json()
    assert egrul["entity_type"] == igor["egrul"]["entity_type"]
    assert egrul["head_name"] == igor["egrul"]["head_name"]
    assert data("sources")["igor_egrul_absent_key"] not in egrul
    fns = client.get(f"/fns/{inn}").json()
    assert fns["income_last_year_rub"] == igor["fns"]["income_last_year_rub"]
    bki = client.post("/bki/report", json=igor["bki_request"]).json()
    assert bki["loans"][0]["balance_rub"] == igor["bki"]["loan"]["balance_rub"]
    assert bki["inquiries_30d"] == igor["bki"]["inquiries_30d"]
    st = client.get(f"/statement/{inn}").json()
    assert len(st["months"]) == igor["statement"]["months_count"]
    assert st["avg_net_flow_rub"] == igor["statement"]["avg_net_flow_rub"]


@pytest.mark.positive
def test_statement_months_param(client: TestClient, igor, data) -> None:
    case = igor["statement_months"]
    st = client.get(f"/statement/{igor['inn']}", params=case["params"]).json()
    assert len(st["months"]) == case["count"]
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in st["months"]]
    assert st["avg_net_flow_rub"] == round(sum(nets) / case["count"])
    other = data("sources")["unknown_months"]
    body = client.get(f"/statement/{other['inn']}", params={"months": other["months"]}).json()
    assert len(body["months"]) == other["months"]


@pytest.mark.positive
def test_unknown_inn_kind_is_stable(client: TestClient, unknown_case: dict, data) -> None:
    first = fetch_all(client, unknown_case["inn"], data)
    assert first == fetch_all(client, unknown_case["inn"], data)
    assert first[0]["entity_type"] == unknown_case["kind"]


@pytest.mark.negative
def test_bad_inn_is_422(client: TestClient, bad_inn: str, data) -> None:
    assert client.get(f"/egrul/{bad_inn}").status_code == 422
    assert client.get(f"/fns/{bad_inn}").status_code == 422
    assert client.get(f"/statement/{bad_inn}").status_code == 422
    assert client.post("/bki/report", json=bki_body(bad_inn, data)).status_code == 422


@pytest.mark.negative
def test_bki_requires_consent(client: TestClient, data) -> None:
    resp = client.post("/bki/report", json=data("sources")["bki_no_consent"])
    assert resp.status_code == 422
