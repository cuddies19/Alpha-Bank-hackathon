"""The four demo clients go through the worker on source mocks and end in their outcome."""

import asyncio

import pytest
from sqlalchemy import select

from app.models import Application, Decision, RuleResult, Score, StatusHistory
from app.pipeline import worker
from tests.source_mocks import load_json

DEMO = load_json("demo_expected")
CLIENTS = ["anna", "sergey", "igor", "marina"]


@pytest.fixture
def run_client(factory, new_application, sources, enrich):
    """Run a client through the worker; returns (application, rules, history, decisions)."""

    def run(name: str):
        sources.set_all(name)
        app_id = new_application(name, submit=True)
        assert asyncio.run(worker.run_once(factory, enrich, 0)) == 1
        with factory() as s:
            app = s.get(Application, app_id)
            rules = s.scalars(select(RuleResult).where(RuleResult.application_id == app_id)).all()
            history = s.scalars(
                select(StatusHistory.to_status)
                .where(StatusHistory.application_id == app_id)
                .order_by(StatusHistory.id)
            ).all()
            decisions = s.scalars(select(Decision).where(Decision.application_id == app_id)).all()
            scores = s.scalars(select(Score).where(Score.application_id == app_id)).all()
        return app, rules, list(history), decisions, scores

    return run


@pytest.mark.smoke
@pytest.mark.positive
@pytest.mark.parametrize("name", CLIENTS)
def test_client_ends_in_expected_status(run_client, name) -> None:
    app, rules, history, decisions, scores = run_client(name)
    want = DEMO[name]
    assert app.status == want["status"]
    assert history == [*DEMO["history_head"], want["status"]]
    assert app.recommendation["kind"] == want["kind"]
    assert app.recommendation["explanation"]
    assert (app.recommendation["score"], app.recommendation["class"]) == (640, "B")
    assert [(s.score, s.risk_class, s.model_version) for s in scores] == [(640, "B", "stub")]
    assert [r.code for r in rules if not r.passed] == want["failed"]
    assert [d.outcome.value for d in decisions] == ([want["decision"]] if want["decision"] else [])


@pytest.mark.positive
def test_igor_gets_counter_offer_recommendation(run_client) -> None:
    app, *_ = run_client("igor")
    rec = app.recommendation
    assert (rec["amount"], rec["term_months"]) == (
        DEMO["igor"]["amount"],
        DEMO["igor"]["term_months"],
    )
    assert "Встречное предложение" in rec["explanation"]


@pytest.mark.positive
def test_marina_is_asked_for_both_documents(run_client) -> None:
    app, _, _, decisions, _ = run_client("marina")
    assert app.recommendation["documents"] == DEMO["marina"]["documents"]
    assert decisions[0].requested_documents == DEMO["marina"]["documents"]


@pytest.mark.positive
def test_anna_decision_has_terms(run_client, applications) -> None:
    _, _, _, decisions, _ = run_client("anna")
    (decision,) = decisions
    assert (decision.amount, decision.term_months) == (
        applications["anna"]["amount"],
        applications["anna"]["term_months"],
    )
    assert decision.rate == 23.0
    assert decision.monthly_payment > 0


@pytest.mark.positive
def test_sergey_is_rejected_with_client_reason(run_client) -> None:
    app, _, _, decisions, _ = run_client("sergey")
    (decision,) = decisions
    assert DEMO["sergey_reason_part"] in decision.decline_reason
    assert decision.client_message == decision.decline_reason


@pytest.mark.positive
def test_rule_values_are_saved_as_text(run_client) -> None:
    _, rules, *_ = run_client("igor")
    row = next(r for r in rules if r.code == "payment_share")
    assert (row.value, row.threshold, row.passed) == tuple(DEMO["igor_share_row"])
