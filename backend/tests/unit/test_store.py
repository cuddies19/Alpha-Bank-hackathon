from types import SimpleNamespace

import pytest

from app.errors import ApiError
from app.models import (
    ApplicationStatus,
    Decision,
    DecisionOutcome,
    RuleResult,
    Score,
    SourceCheck,
    SourceStatus,
)
from app.pipeline import store
from app.state.machine import SYSTEM_ACTOR
from tests.unit.fakes import FakeSession


@pytest.fixture
def application(unit):
    return SimpleNamespace(id=unit["app_id"], recommendation=None)


@pytest.fixture
def session(application):
    return FakeSession(rows={application.id: application}, scalar_rows=[application])


@pytest.fixture
def calls(monkeypatch):
    """Replace transition(); it records its calls and raises what `calls.error` holds."""
    state = SimpleNamespace(seen=[], error=None)

    def transition(db, application, to_status, actor, payload):
        if state.error:
            raise state.error
        state.seen.append((application, to_status, actor, payload))

    monkeypatch.setattr(store, "transition", transition)
    return state


@pytest.mark.positive
def test_get_application_found(session, application) -> None:
    assert store.get_application(session, application.id) is application


@pytest.mark.negative
def test_get_application_missing(session, application) -> None:
    assert store.get_application(session, application.id + 1) is None


@pytest.mark.positive
def test_take_submitted_returns_a_list(session, application) -> None:
    assert store.take_submitted(session, 5) == [application]


@pytest.mark.positive
def test_stuck_ids_returns_a_list(session, application) -> None:
    assert store.stuck_ids(session) == [application]


@pytest.mark.positive
def test_move_goes_through_the_state_machine(session, application, calls, unit) -> None:
    assert store.move(session, application.id, "approved", unit["comment"], unit["labels"])
    ((app, status, actor, payload),) = calls.seen
    assert app is application
    assert status == ApplicationStatus.approved
    assert actor is SYSTEM_ACTOR
    assert payload == {"comment": unit["comment"], "labels": unit["labels"]}


@pytest.mark.positive
def test_move_without_labels_sends_an_empty_list(session, application, calls, unit) -> None:
    store.move(session, application.id, "approved", unit["comment"])
    assert calls.seen[0][3]["labels"] == []


@pytest.mark.negative
def test_move_unknown_application(calls) -> None:
    assert store.move(FakeSession(), 999, "approved", "c") is False
    assert calls.seen == []


@pytest.mark.negative
def test_move_conflict_returns_false(session, application, calls, unit) -> None:
    calls.error = ApiError(409, "invalid_transition", unit["withdrawn_message"])
    assert store.move(session, application.id, "approved", "c") is False


@pytest.mark.negative
def test_move_other_errors_are_raised(session, application, calls) -> None:
    calls.error = ApiError(403, "forbidden", "no")
    with pytest.raises(ApiError):
        store.move(session, application.id, "approved", "c")


@pytest.mark.positive
@pytest.mark.parametrize("case", [0, 1, 2])
def test_save_source_check_maps_status_and_fills_defaults(unit, case) -> None:
    s = FakeSession()
    c = unit["source_checks"][case]
    store.save_source_check(s, unit["app_id"], *c["args"])
    (check,) = s.added
    assert isinstance(check, SourceCheck)
    want = c["expected"]
    assert check.application_id == unit["app_id"]
    assert check.status == SourceStatus(want["status"])
    for field in ("source", "attempts", "response_time_ms", "response"):
        assert getattr(check, field) == want[field]


@pytest.mark.positive
def test_save_score(unit) -> None:
    s = FakeSession()
    store.save_score(s, unit["app_id"], *unit["score"].values())
    (score,) = s.added
    assert isinstance(score, Score)
    assert (score.application_id, score.score, score.risk_class, score.model_version) == (
        unit["app_id"],
        640,
        "B",
        "stub",
    )


@pytest.mark.positive
def test_save_rule_results_stores_values_as_text(unit) -> None:
    s = FakeSession()
    store.save_rule_results(s, unit["app_id"], unit["rule_results"])
    assert all(isinstance(r, RuleResult) for r in s.added)
    assert [(r.code, r.value, r.threshold, r.passed, r.comment) for r in s.added] == [
        tuple(row) for row in unit["rule_rows"]
    ]


@pytest.mark.positive
def test_save_decision(unit) -> None:
    s = FakeSession()
    store.save_decision(s, unit["app_id"], "approve", **unit["decision_fields"])
    (decision,) = s.added
    assert isinstance(decision, Decision)
    assert decision.outcome == DecisionOutcome.approve
    assert decision.application_id == unit["app_id"]
    for field, value in unit["decision_fields"].items():
        assert getattr(decision, field) == value


@pytest.mark.positive
def test_set_recommendation(session, application, unit) -> None:
    store.set_recommendation(session, application.id, unit["recommendation"])
    assert application.recommendation == unit["recommendation"]
