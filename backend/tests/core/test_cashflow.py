from __future__ import annotations

from app.models import SourceCheck, SourceStatus
from app.services import statements
from app.services.finance import monthly_payment
from tests.source_mocks import load_json

STATEMENT = load_json("statement_igor")["body"]


def _add_check(db, application_id: int, status: SourceStatus, response: dict) -> None:
    db.add(
        SourceCheck(
            application_id=application_id,
            source="statement",
            status=status,
            response=response,
            response_time_ms=120,
            attempts=1,
        )
    )
    db.commit()


def test_cashflow_uses_statement_and_matches_bank(
    client, db, igor, olga, create_application, monkeypatch
):
    application = create_application()
    _add_check(db, application["id"], SourceStatus.ok, STATEMENT)

    def no_live_request(*args, **kwargs):
        raise AssertionError("saved statement must be used without a live request")

    monkeypatch.setattr(statements, "fetch", no_live_request)

    response = client.get("/me/cashflow", headers=igor)
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["months"]) == 12
    assert data["balance"] == 1_240_500
    assert data["inflows"] == 40_600_000
    assert data["net_flow"] == 7_320_000
    assert data["months"][-1]["month"] == "2026-10"
    assert data["months"][-1]["net_flow"] == 670_000

    client_average = round(data["net_flow"] / len(data["months"]))

    card = client.get(f"/bank/applications/{application['id']}", headers=olga)
    assert card.status_code == 200, card.text
    check = next(item for item in card.json()["checks"] if item["source"] == "statement")
    bank_months = check["response"]["months"]
    bank_average = round(
        sum(item["inflow_rub"] - item["outflow_rub"] for item in bank_months) / len(bank_months)
    )

    assert client_average == bank_average == 610_000
    assert round(monthly_payment(2_400_000, 18, 21.5) / client_average * 100) == 26
    assert round(monthly_payment(3_000_000, 18, 21.5) / client_average * 100) == 32


def test_cashflow_fetches_statement_before_pipeline(
    client, db, igor, create_application, monkeypatch
):
    application = create_application()
    _add_check(db, application["id"], SourceStatus.unavailable, {})
    monkeypatch.setattr(statements, "fetch", lambda *args, **kwargs: STATEMENT)

    response = client.get("/me/cashflow", headers=igor)
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["months"]) == 12
    assert round(data["net_flow"] / len(data["months"])) == 610_000


def test_cashflow_falls_back_when_statement_is_unavailable(client, igor, monkeypatch):
    monkeypatch.setattr(statements, "fetch", lambda *args, **kwargs: None)

    response = client.get("/me/cashflow", headers=igor)
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["months"]) == 6
    assert data["net_flow"] > 0
