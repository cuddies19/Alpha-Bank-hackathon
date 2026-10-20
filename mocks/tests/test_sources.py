import pytest
from fastapi.testclient import TestClient

IGOR = "7701234567"
UNKNOWN = "5001234567"
UNKNOWN_IP = "500123456789"


@pytest.mark.medium
def test_igor_all_sources(client: TestClient) -> None:
    egrul = client.get(f"/egrul/{IGOR}").json()
    assert egrul["entity_type"] == "ul" and egrul["head_name"] == "Соколов И. А."
    assert "ogrnip" not in egrul
    assert client.get(f"/fns/{IGOR}").json()["income_last_year_rub"] == 44_800_000
    bki = client.post("/bki/report", json={"inn": IGOR, "consent_id": "c1"}).json()
    assert bki["loans"][0]["balance_rub"] == 450_000 and bki["inquiries_30d"] == 2
    st = client.get(f"/statement/{IGOR}").json()
    assert len(st["months"]) == 12 and st["avg_net_flow_rub"] == 610_000


@pytest.mark.medium
def test_statement_months_param(client: TestClient) -> None:
    st = client.get(f"/statement/{IGOR}", params={"months": 3}).json()
    assert len(st["months"]) == 3
    nets = [m["inflow_rub"] - m["outflow_rub"] for m in st["months"]]
    assert st["avg_net_flow_rub"] == round(sum(nets) / 3)
    assert len(client.get(f"/statement/{UNKNOWN}", params={"months": 6}).json()["months"]) == 6


@pytest.mark.medium
@pytest.mark.parametrize("inn,kind", [(UNKNOWN, "ul"), (UNKNOWN_IP, "ip")])
def test_unknown_inn_is_stable(client: TestClient, inn: str, kind: str) -> None:
    def fetch() -> list:
        return [
            client.get(f"/egrul/{inn}").json(),
            client.get(f"/fns/{inn}").json(),
            client.post("/bki/report", json={"inn": inn, "consent_id": "c1"}).json(),
            client.get(f"/statement/{inn}").json(),
        ]

    first = fetch()
    assert first == fetch()
    assert first[0]["entity_type"] == kind


@pytest.mark.medium
@pytest.mark.parametrize("inn", ["123", "12345678901", "abcdefghij", "٧" * 10])
def test_bad_inn_is_422(client: TestClient, inn: str) -> None:
    assert client.get(f"/egrul/{inn}").status_code == 422
    assert client.get(f"/fns/{inn}").status_code == 422
    assert client.get(f"/statement/{inn}").status_code == 422
    assert client.post("/bki/report", json={"inn": inn, "consent_id": "c1"}).status_code == 422


@pytest.mark.medium
def test_bki_requires_consent(client: TestClient) -> None:
    assert client.post("/bki/report", json={"inn": IGOR}).status_code == 422
