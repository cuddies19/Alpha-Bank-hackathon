import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.api.assistant import router
from app.assistant import chat, rules, tools
from app.assistant.chat import answer
from app.assistant.settings import AssistantSettings
from app.db import get_db
from app.deps import get_current_user
from app.models import Product
from app.schemas.assistant import ChatRequest
from app.services import finance
from tests.source_mocks import load_json

SCENARIOS = load_json("assistant_scenarios")
CASES = [pytest.param(case, id=case["name"]) for case in SCENARIOS["chat_cases"]]


@pytest.mark.positive
@pytest.mark.parametrize("case", CASES)
def test_chat_answer(case, db, users, add_applications, add_loan, drop_products):
    ids = add_applications(case.get("apps", []))
    if case.get("no_products"):
        drop_products()
    if case.get("loan"):
        add_loan(ids)
    request = ChatRequest(
        message=case["message"], application_id=ids[case["ref"]] if "ref" in case else None
    )

    response = answer(db, users[case["user"]], request)

    for text in case.get("contains", []):
        assert text in response.message
    for text in case.get("not_contains", []):
        assert text not in response.message
    assert [action.type for action in response.actions] == case["actions"]
    assert len(response.suggestions) == 3


@pytest.mark.positive
def test_payment_is_from_finance(db, users):
    response = answer(
        db, users["igor.sokolov"], ChatRequest(message=SCENARIOS["chat_cases"][0]["message"])
    )

    check = SCENARIOS["payment_check"]
    match = tools.match_products(db, "", check["amount"], check["term"])["items"][0]
    rate = db.scalar(select(Product.rate).where(Product.code == match["product_code"]))
    payment = finance.monthly_payment(check["amount"], check["term"], rate)
    assert rules.rub(payment) in response.message
    assert response.actions[0].payload == {
        "amount": check["amount"],
        "term_months": check["term"],
    }


@pytest.mark.positive
def test_other_user_application_not_found(db, users, add_applications):
    ids = add_applications(["anna_draft"])

    for tool in (tools.application_status, tools.explain_decision, tools.completeness_check):
        assert tool(db, users["igor.sokolov"], ids["anna_draft"]) == {"found": False}
    assert tools.application_status(db, users["anna.belova"], ids["anna_draft"])["found"]


@pytest.mark.negative
@pytest.mark.parametrize("bad_id", SCENARIOS["bad_ids"])
def test_application_id_out_of_range(bad_id, db, users, add_applications):
    add_applications(["igor_draft"])

    assert tools.application_status(db, users["igor.sokolov"], bad_id) == {"found": False}


@pytest.mark.positive
def test_account_summary_loans(db, users, add_applications, add_loan):
    add_loan(add_applications(["igor_draft"]))
    payment = SCENARIOS["loan"]["monthly_payment"]

    data = tools.account_summary(db, users["igor.sokolov"])

    assert data["loans"][0]["payment"] == payment
    assert data["loan_payments"] == payment


@pytest.mark.positive
def test_calc_payment_default_rate(db):
    data = tools.calc_payment(db, 1_000_000, 12)

    assert data["monthly_payment"] == finance.monthly_payment(1_000_000, 12, 21.5)
    assert data["product_name"] is None


@pytest.mark.negative
def test_calc_payment_bad_input(db):
    assert tools.calc_payment(db, 0, 12)["ok"] is False


@pytest.mark.positive
@pytest.mark.parametrize("text, expected", SCENARIOS["amounts"])
def test_parse_amount(text, expected):
    assert rules.parse_amount(text) == expected


@pytest.mark.positive
@pytest.mark.parametrize("text, expected", SCENARIOS["terms"])
def test_parse_term(text, expected):
    assert rules.parse_term(text) == expected


@pytest.mark.positive
@pytest.mark.parametrize("text, expected", SCENARIOS["intents"])
def test_detect_intent(text, expected):
    assert rules.detect_intent(text) == expected


@pytest.mark.positive
def test_route(db, users, monkeypatch):
    monkeypatch.setattr(chat, "assistant_settings", AssistantSettings(mode="rules"))
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: users["igor.sokolov"]

    response = TestClient(app).post("/assistant/chat", json={"message": SCENARIOS["route_message"]})

    assert response.status_code == 200
    body = response.json()
    assert body["actions"][0]["type"] == "open_financing"
    assert body["disclaimer"]
