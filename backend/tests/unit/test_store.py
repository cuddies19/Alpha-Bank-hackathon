import pytest

from app.db import store
from app.db.models import Application, SourceCheck, StatusHistory
from tests.unit.fakes import FakeSession, application


@pytest.fixture
def draft(unit):
    """An application row in draft, as the DB would hold it."""
    return application(unit["app_row"])


@pytest.fixture
def session(draft):
    return FakeSession(rows={draft.id: draft}, scalar_rows=[draft])


@pytest.mark.positive
def test_create_application_applies_defaults(applications, unit) -> None:
    s = FakeSession()
    data = applications["igor"]
    app = store.create_application(s, data["inn"], data["product"], data["amount_rub"], data["term_months"])
    assert s.added == [app]
    assert s.flushes == 1
    assert s.refreshed == [app]
    for field, value in unit["create_defaults"].items():
        assert getattr(app, field) == value
    assert (app.inn, app.product, app.amount_rub, app.term_months) == (
        data["inn"],
        data["product"],
        data["amount_rub"],
        data["term_months"],
    )


@pytest.mark.positive
def test_create_application_keeps_consents_and_documents(applications) -> None:
    data = applications["with_passport"]
    app = store.create_application(
        FakeSession(),
        data["inn"],
        data["product"],
        data["amount_rub"],
        data["term_months"],
        consent_bki=data["consent_bki"],
        consent_id=data["consent_id"],
        documents=data["documents"],
    )
    assert app.consent_bki is True
    assert app.consent_id == data["consent_id"]
    assert app.documents == data["documents"]


@pytest.mark.positive
def test_get_application_found(session, draft) -> None:
    assert store.get_application(session, draft.id) is draft


@pytest.mark.negative
def test_get_application_missing(session, draft) -> None:
    assert store.get_application(session, draft.id + 1) is None


@pytest.mark.positive
def test_change_status_updates_row_and_writes_history(session, draft, unit) -> None:
    result = store.change_status(session, draft.id, "submitted", "why", unit["history_meta"])
    assert result is draft
    assert draft.status == "submitted"
    assert draft.status_label == "Заявка отправлена"
    (history,) = [o for o in session.added if isinstance(o, StatusHistory)]
    assert (history.application_id, history.from_status, history.to_status, history.reason) == (
        draft.id,
        "draft",
        "submitted",
        "why",
    )
    assert history.meta == unit["history_meta"]
    assert session.flushes == 1
    assert session.refreshed == [draft]


@pytest.mark.positive
def test_change_status_custom_label_and_empty_meta(session, draft, unit) -> None:
    store.change_status(session, draft.id, "submitted", None, label=unit["custom_label"])
    assert draft.status_label == unit["custom_label"]
    (history,) = session.added
    assert history.meta == {}
    assert history.reason is None


@pytest.mark.negative
def test_change_status_unknown_application() -> None:
    s = FakeSession()
    with pytest.raises(ValueError, match="not found"):
        store.change_status(s, 999, "submitted", None)
    assert s.added == []


@pytest.mark.negative
def test_change_status_illegal_transition_changes_nothing(session, draft) -> None:
    with pytest.raises(ValueError, match="illegal status change: draft -> approved"):
        store.change_status(session, draft.id, "approved", None)
    assert draft.status == "draft"
    assert session.added == []


@pytest.mark.positive
def test_save_source_check_stores_all_fields(unit) -> None:
    s = FakeSession()
    c = unit["source_check"]
    store.save_source_check(
        s, c["app_id"], c["source"], c["status"], c["attempts"], c["latency_ms"], c["payload"], c["message"]
    )
    (check,) = s.added
    assert isinstance(check, SourceCheck)
    for field, value in c.items():
        assert getattr(check, "application_id" if field == "app_id" else field) == value
    assert s.flushes == 1


@pytest.mark.positive
def test_save_source_check_defaults_to_one_attempt() -> None:
    s = FakeSession()
    store.save_source_check(s, 7, "fns", "ok")
    (check,) = s.added
    assert check.attempts == 1
    assert check.latency_ms is None


@pytest.mark.positive
def test_save_recommendation(session, draft, unit) -> None:
    store.save_recommendation(session, draft.id, unit["recommendation"])
    assert draft.recommendation == unit["recommendation"]
    assert session.flushes == 1


@pytest.mark.negative
def test_save_recommendation_unknown_application(unit) -> None:
    with pytest.raises(ValueError, match="not found"):
        store.save_recommendation(FakeSession(), 999, unit["recommendation"])


@pytest.mark.positive
def test_take_submitted_returns_a_list(session, draft) -> None:
    result = store.take_submitted(session, 5)
    assert result == [draft]
    assert isinstance(result, list)
    assert isinstance(result[0], Application)


@pytest.mark.positive
def test_save_rule_results_stores_values_as_text(unit) -> None:
    s = FakeSession()
    store.save_rule_results(s, 7, unit["rule_results"])
    assert [(r.application_id, r.code, r.value, r.threshold, r.passed) for r in s.added] == [
        tuple(row) for row in unit["rule_rows"]
    ]
    assert s.flushes == 1
