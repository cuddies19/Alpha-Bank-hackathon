import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.db import store
from app.db.models import Base, SourceCheck, StatusHistory
from app.db.statuses import STATUSES, TRANSITIONS


def _new(session):
    return store.create_application(
        session, "7707083893", "overdraft", 1_000_000, 12, True, "c1", [{"name": "a"}]
    )


@pytest.fixture
def factory(pg_url):
    engine = create_engine(pg_url)
    Base.metadata.create_all(engine)
    yield sessionmaker(engine, expire_on_commit=False)
    engine.dispose()


@pytest.fixture
def session(factory):
    with factory() as s:
        yield s


@pytest.mark.small
def test_transitions_table_is_consistent() -> None:
    assert set(TRANSITIONS) == set(STATUSES)
    for targets in TRANSITIONS.values():
        assert targets <= set(STATUSES)


@pytest.mark.small
def test_transition_edges_are_pinned() -> None:
    assert {
        "draft": {"submitted"},
        "submitted": {"completeness_check"},
        "completeness_check": {"needs_info", "enrichment", "manual_review"},
        "needs_info": {"submitted"},
        "enrichment": {"scoring", "manual_review"},
        "scoring": {"rules", "manual_review"},
        "rules": {"approved", "rejected", "manual_review", "counter_offer"},
        "manual_review": {"approved", "rejected", "counter_offer", "needs_info"},
        "counter_offer": {"approved", "rejected"},
        "approved": {"issued"},
        "rejected": set(),
        "issued": set(),
    } == TRANSITIONS


@pytest.mark.medium
def test_create_application(session) -> None:
    row = _new(session)
    assert row.status == "draft"
    assert row.documents == [{"name": "a"}]
    assert row.created_at is not None
    assert store.get_application(session, row.id) is row
    assert store.get_application(session, 999) is None


@pytest.mark.medium
def test_legal_change_writes_history(session) -> None:
    row = _new(session)
    updated = store.change_status(session, row.id, "submitted", "sent", {"k": 1}, label="Submitted")
    assert updated.status == "submitted"
    assert updated.status_label == "Submitted"
    history = session.execute(
        select(StatusHistory.from_status, StatusHistory.to_status, StatusHistory.reason, StatusHistory.meta)
    ).all()
    assert [tuple(h) for h in history] == [("draft", "submitted", "sent", {"k": 1})]


@pytest.mark.medium
def test_illegal_change_raises_and_writes_nothing(session) -> None:
    row = _new(session)
    with pytest.raises(ValueError, match="illegal status change"):
        store.change_status(session, row.id, "issued", "skip")
    assert store.get_application(session, row.id).status == "draft"
    assert session.scalar(select(func.count()).select_from(StatusHistory)) == 0


@pytest.mark.medium
def test_unknown_application_raises(session) -> None:
    with pytest.raises(ValueError, match="not found"):
        store.change_status(session, 999, "submitted", "sent")


@pytest.mark.medium
def test_save_source_check(session) -> None:
    row = _new(session)
    store.save_source_check(session, row.id, "fns", "ok", 2, 40, {"x": 1}, None)
    check = session.scalars(select(SourceCheck)).one()
    assert (check.source, check.attempts, check.payload) == ("fns", 2, {"x": 1})


@pytest.mark.medium
def test_save_recommendation(session) -> None:
    row = _new(session)
    store.save_recommendation(session, row.id, {"score": 640})
    session.expire_all()
    assert store.get_application(session, row.id).recommendation == {"score": 640}


@pytest.mark.medium
def test_take_submitted_skips_locked(factory) -> None:
    with factory.begin() as s:
        ids = [_new(s).id for _ in range(2)]
        for app_id in ids:
            store.change_status(s, app_id, "submitted", "sent")
    with factory.begin() as first_session:
        first = store.take_submitted(first_session, 1)
        assert [r.id for r in first] == [ids[0]]
        # A second session skips the row locked above.
        with factory.begin() as other:
            second = store.take_submitted(other, 5)
        assert [r.id for r in second] == [ids[1]]
