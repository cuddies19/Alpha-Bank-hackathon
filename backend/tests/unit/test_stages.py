from datetime import date

import pytest

from app.models import ApplicationStatus
from app.pipeline import stages
from app.pipeline.stages import process_application
from tests.source_mocks import load_json
from tests.unit.conftest import TODAY

EXPECTED = load_json("expected")

PAUSE = 0.25
IGOR, NO_CONSENT, ANNA, MARINA = 1, 2, 3, 4


@pytest.fixture(autouse=True)
def more_applications(stage_store, row):
    stage_store.apps[ANNA] = row("anna", ANNA)
    stage_store.apps[MARINA] = row("marina", MARINA)


@pytest.fixture
def process(run, factory, stage_store, enrich, sleeps):
    def go(app_id: int, enrich_fn=None, **kwargs) -> None:
        kwargs.setdefault("today", lambda: TODAY)
        run(process_application(factory, app_id, enrich_fn or enrich, PAUSE, sleeps, **kwargs))

    return go


@pytest.fixture
def broken():
    async def broken(inn: str, consent_id: str):
        raise RuntimeError("boom")

    return broken


@pytest.mark.smoke
@pytest.mark.positive
def test_complete_application_goes_through_rules_to_manual_review(
    process, stage_store, sleeps, expected
) -> None:
    process(IGOR)
    (move,) = stage_store.moves
    assert (move.app_id, move.to_status) == (IGOR, "manual_review")
    assert move.comment == expected["manual_comment"]
    assert move.labels is None
    assert stage_store.decisions == []
    assert sleeps.calls == [PAUSE] * 4


@pytest.mark.positive
@pytest.mark.parametrize("case", EXPECTED["recommended_outcomes"], ids=lambda c: f"{c[0]}-{c[1]}")
def test_recommended_outcome_uses_core_values(case) -> None:
    outcome, kind, want = case
    assert stages.recommended_outcome(outcome, kind) == want


@pytest.mark.positive
def test_score_rules_and_recommendation_are_saved(process, stage_store, expected) -> None:
    process(IGOR)
    assert stage_store.scores == [(IGOR, 640, "B", "stub")]
    ((app_id, rows),) = stage_store.rule_results
    assert app_id == IGOR
    assert [r["code"] for r in rows if not r["passed"]] == ["payment_share"]
    assert stage_store.recommendations == [(IGOR, expected["igor_recommendation"])]


@pytest.mark.positive
def test_rules_get_the_application_and_the_injected_date(
    process, monkeypatch, applications
) -> None:
    seen = {}

    def evaluate(application, sources, score, rules, today):
        seen.update(application=application, score=score, today=today)
        return real_evaluate(application, sources, score, rules, today)

    real_evaluate = stages.evaluate
    monkeypatch.setattr(stages, "evaluate", evaluate)
    process(IGOR, today=lambda: date(2026, 1, 2))
    igor = applications["igor"]
    assert seen["application"] == {
        "product": igor["product"],
        "amount_rub": igor["amount"],
        "term_months": igor["term_months"],
        "rate": 21.5,
        "documents": [{"type": "financial_statements"}],
    }
    assert seen["score"] == {"risk_class": "B"}
    assert seen["today"] == date(2026, 1, 2)


@pytest.mark.positive
def test_approved_has_an_approve_decision(process, stage_store, sources, applications) -> None:
    sources.set_all("anna")
    process(ANNA)
    assert stage_store.statuses == ["approved"]
    ((app_id, outcome, fields),) = stage_store.decisions
    assert (app_id, outcome) == (ANNA, "approve")
    assert fields["amount"] == applications["anna"]["amount"]
    assert fields["term_months"] == applications["anna"]["term_months"]
    assert fields["rate"] == 23.0
    assert fields["monthly_payment"] > 0


@pytest.mark.positive
def test_rejected_has_a_decline_decision(process, stage_store, sources, expected) -> None:
    sources.egrul.set_dataset("liquidating")
    process(IGOR)
    (move,) = stage_store.moves
    assert (move.to_status, move.comment) == ("rejected", expected["rejected_reason"])
    ((_, outcome, fields),) = stage_store.decisions
    assert outcome == "decline"
    assert fields == {
        "client_message": expected["rejected_reason"],
        "decline_reason": expected["rejected_reason"],
    }
    assert stage_store.recommendations[0][1]["kind"] == "none"


@pytest.mark.positive
def test_requested_documents_go_to_the_client(process, stage_store, sources, expected) -> None:
    sources.set_all("marina")
    process(MARINA)
    assert stage_store.statuses == ["client_action"]
    ((_, outcome, fields),) = stage_store.decisions
    assert outcome == "request"
    assert fields["requested_documents"] == stage_store.recommendations[0][1]["documents"]
    assert len(fields["requested_documents"]) == 2
    assert (
        fields["client_message"] == stage_store.moves[0].comment == expected["marina_request_text"]
    )


@pytest.mark.negative
def test_nothing_is_saved_when_the_status_cannot_change(process, stage_store, sources) -> None:
    sources.set_all("anna")
    stage_store.refuse = {"approved"}
    process(ANNA)
    assert stage_store.moves == []
    assert stage_store.rule_results == []
    assert stage_store.recommendations == []
    assert stage_store.decisions == []


@pytest.mark.negative
def test_scoring_unavailable_goes_to_manual_review(process, stage_store, expected) -> None:
    async def down(inn, results):
        return {"status": "unavailable", "message": "Скоринг не ответил"}

    process(IGOR, score=down)
    (move,) = stage_store.moves
    assert (move.to_status, move.comment) == ("manual_review", "Скоринг не ответил")
    assert move.labels == [expected["labels"]["scoring_down"]]
    assert stage_store.scores == []
    assert stage_store.rule_results == []
    assert stage_store.recommendations == []


@pytest.mark.positive
def test_default_score_reads_settings(run, monkeypatch) -> None:
    asked = {}

    async def get_score(inn, *, results, scoring_url, timeout_s, attempts, pause_s):
        asked.update(inn=inn, url=scoring_url)
        return {"status": "ok"}

    monkeypatch.setattr(stages, "get_score", get_score)
    monkeypatch.setattr(stages.pipeline_settings, "scoring_url", "http://ds.test")
    assert run(stages.default_score("123", {})) == {"status": "ok"}
    assert asked == {"inn": "123", "url": "http://ds.test"}


@pytest.mark.positive
def test_every_source_result_is_saved(process, stage_store, expected) -> None:
    process(IGOR)
    assert [c[1] for c in stage_store.checks] == expected["sources"]
    assert {c[2] for c in stage_store.checks} == {"ok"}
    assert {c[0] for c in stage_store.checks} == {IGOR}


@pytest.mark.positive
def test_each_step_has_its_own_transaction(process, factory) -> None:
    process(IGOR)
    assert len(factory.sessions) == 4


@pytest.mark.negative
def test_incomplete_application_goes_to_the_client(process, stage_store, sources, expected) -> None:
    process(NO_CONSENT)
    (move,) = stage_store.moves
    assert move.to_status == "client_action"
    assert move.comment == expected["incomplete_rows"][1]["text"]
    assert sources.bki.calls == []
    assert stage_store.checks == []


@pytest.mark.negative
def test_silent_source_sends_to_manual_review(process, stage_store, sources, expected) -> None:
    sources.bki.set_dataset("timeout")
    process(IGOR)
    (move,) = stage_store.moves
    assert move.to_status == "manual_review"
    assert move.comment == expected["source_silent_reason"]
    assert move.labels == [expected["labels"]["bki_unavailable"]]
    assert len(stage_store.checks) == len(expected["sources"])
    assert stage_store.scores == []
    assert stage_store.recommendations == []


@pytest.mark.negative
def test_source_error_sends_to_manual_review(process, stage_store, sources, expected) -> None:
    sources.fns.set_dataset("bad_request")
    process(IGOR)
    (move,) = stage_store.moves
    assert move.to_status == "manual_review"
    assert move.comment == expected["source_error_reason"]
    assert move.labels == [expected["labels"]["source_error"]]


@pytest.mark.negative
def test_crash_falls_back_to_manual_review(process, stage_store, broken, expected) -> None:
    process(IGOR, broken)
    (move,) = stage_store.moves
    assert move.to_status == "manual_review"
    assert move.comment == expected["interrupted_comment"]
    assert move.labels == [expected["labels"]["processing_error"]]


@pytest.mark.negative
def test_failing_fallback_is_swallowed(process, stage_store, broken) -> None:
    stage_store.fail_on = {"manual_review"}
    process(IGOR, broken)  # must not raise
    assert stage_store.moves == []


@pytest.mark.negative
def test_unknown_application_is_skipped(process, stage_store, sources) -> None:
    process(99)
    assert stage_store.moves == []
    assert sources.bki.calls == []


@pytest.mark.negative
def test_withdrawn_application_is_skipped_without_http_calls(
    process, stage_store, sources, sleeps
) -> None:
    stage_store.apps[IGOR].status = ApplicationStatus.withdrawn
    process(IGOR)
    assert stage_store.moves == []
    assert stage_store.checks == []
    assert sources.bki.calls == []
    assert sleeps.calls == [PAUSE]
