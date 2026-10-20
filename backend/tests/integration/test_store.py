import pytest
from sqlalchemy import func, select, text

from app.db import store
from app.db.models import SourceCheck, StatusHistory


@pytest.mark.positive
def test_create_application(session, new_application, expected) -> None:
    row = store.get_application(session, new_application("with_document"))
    assert row.status == "draft"
    assert row.status_label == expected["draft_label"]
    assert row.documents == [{"name": "a"}]
    assert row.created_at is not None
    assert store.get_application(session, 999) is None


@pytest.mark.positive
def test_legal_change_writes_history(session, new_application) -> None:
    app_id = new_application()
    updated = store.change_status(session, app_id, "submitted", "sent", {"k": 1}, label="Submitted")
    assert updated.status == "submitted"
    assert updated.status_label == "Submitted"
    history = session.execute(
        select(StatusHistory.from_status, StatusHistory.to_status, StatusHistory.reason, StatusHistory.meta)
    ).all()
    assert [tuple(h) for h in history] == [("draft", "submitted", "sent", {"k": 1})]


@pytest.mark.negative
def test_illegal_change_raises_and_writes_nothing(session, new_application) -> None:
    app_id = new_application()
    with pytest.raises(ValueError, match="illegal status change"):
        store.change_status(session, app_id, "issued", "skip")
    assert store.get_application(session, app_id).status == "draft"
    assert session.scalar(select(func.count()).select_from(StatusHistory)) == 0


@pytest.mark.negative
def test_unknown_application_raises(session) -> None:
    with pytest.raises(ValueError, match="not found"):
        store.change_status(session, 999, "submitted", "sent")


@pytest.mark.positive
def test_save_source_check(session, new_application) -> None:
    app_id = new_application()
    store.save_source_check(session, app_id, "fns", "ok", 2, 40, {"x": 1}, None)
    check = session.scalars(select(SourceCheck)).one()
    assert (check.source, check.attempts, check.payload) == ("fns", 2, {"x": 1})


@pytest.mark.positive
def test_save_recommendation(session, new_application) -> None:
    app_id = new_application()
    store.save_recommendation(session, app_id, {"score": 640})
    session.expire_all()
    assert store.get_application(session, app_id).recommendation == {"score": 640}


@pytest.mark.positive
def test_take_submitted_skips_locked(factory, new_application) -> None:
    ids = [new_application(submit=True) for _ in range(2)]
    with factory.begin() as first_session:
        first = store.take_submitted(first_session, 1)
        assert [r.id for r in first] == [ids[0]]
        # A second session skips the row locked above.
        with factory.begin() as other:
            other.execute(text("SET LOCAL lock_timeout = '1s'"))
            second = store.take_submitted(other, 5)
        assert [r.id for r in second] == [ids[1]]


@pytest.mark.positive
def test_save_recommendation_updated_at_readable_after_close(factory, new_application) -> None:
    app_id = new_application()
    with factory.begin() as s:
        row = store.get_application(s, app_id)
        store.save_recommendation(s, app_id, {"score": 1})
    assert row.updated_at is not None
