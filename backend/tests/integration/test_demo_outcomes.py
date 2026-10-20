"""The four demo clients go through the worker on source mocks and end in their outcome."""

import asyncio

import pytest
from sqlalchemy import select

from app.db import store
from app.db.models import RuleResult, StatusHistory
from app.pipeline import worker
from tests.source_mocks import load_json

DEMO = load_json("demo_expected")
CLIENTS = ["anna", "sergey", "igor", "marina"]


@pytest.fixture
def run_client(factory, new_application, sources, enrich):
    """Run a client through the worker; returns (application, failed rule codes, history)."""

    def run(name: str):
        sources.set_all(name)
        app_id = new_application(name, submit=True)
        assert asyncio.run(worker.run_once(factory, enrich, 0)) == 1
        with factory() as s:
            app = store.get_application(s, app_id)
            rules = s.scalars(select(RuleResult).where(RuleResult.application_id == app_id)).all()
            history = s.scalars(
                select(StatusHistory.to_status)
                .where(StatusHistory.application_id == app_id)
                .order_by(StatusHistory.id)
            ).all()
        return app, rules, list(history)

    return run


@pytest.mark.smoke
@pytest.mark.positive
@pytest.mark.parametrize("name", CLIENTS)
def test_client_ends_in_expected_status(run_client, name) -> None:
    app, rules, history = run_client(name)
    want = DEMO[name]
    assert app.status == want["status"]
    assert history[-3:-1] == DEMO["history_tail"]
    assert history[-1] == want["status"]
    assert app.recommendation["kind"] == want["kind"]
    assert app.recommendation["explanation"]
    assert (app.recommendation["score"], app.recommendation["class"]) == (640, "B")
    assert rules
    assert [r.code for r in rules if not r.passed] == want["failed"]


@pytest.mark.positive
def test_igor_gets_counter_offer(run_client) -> None:
    app, _, _ = run_client("igor")
    rec = app.recommendation
    assert (rec["amount"], rec["term_months"]) == (DEMO["igor"]["amount"], DEMO["igor"]["term_months"])
    assert "Встречное предложение" in rec["explanation"]


@pytest.mark.positive
def test_marina_is_asked_for_both_documents(run_client) -> None:
    app, _, _ = run_client("marina")
    assert app.recommendation["documents"] == DEMO["marina"]["documents"]


@pytest.mark.positive
def test_sergey_is_rejected_with_client_reason(run_client) -> None:
    app, _, _ = run_client("sergey")
    assert DEMO["sergey_reason_part"] in app.status_label
    assert app.status_label == app.recommendation["explanation"]


@pytest.mark.positive
def test_rule_values_are_saved_as_text(run_client) -> None:
    _, rules, _ = run_client("igor")
    row = next(r for r in rules if r.code == "payment_share")
    assert (row.value, row.threshold, row.passed) == tuple(DEMO["igor_share_row"])
