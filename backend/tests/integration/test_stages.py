import asyncio

import pytest
from sqlalchemy import select, text

from app.db import store
from app.db.models import SourceCheck, StatusHistory
from app.pipeline import worker
from app.pipeline.stages import process_application


@pytest.fixture
def process(factory, enrich, no_sleep):
    """Claim the application and run its stages; returns the application afterwards."""

    def run(app_id: int, enrich_with=None):
        assert worker.claim(factory) == [app_id]
        asyncio.run(process_application(factory, app_id, enrich_with or enrich, 0, no_sleep))
        with factory() as s:
            return store.get_application(s, app_id)

    return run


@pytest.fixture
def broken_enrich():
    async def enrich(inn, consent_id):
        raise RuntimeError("boom")

    return enrich


def _history_field(factory, app_id: int, to_status: str, column):
    with factory() as s:
        return s.scalars(
            select(column).where(StatusHistory.application_id == app_id, StatusHistory.to_status == to_status)
        ).one()


@pytest.mark.smoke
@pytest.mark.positive
def test_happy_path_ends_in_manual_review(factory, new_application, process, expected) -> None:
    app_id = new_application(submit=True)
    app = process(app_id)
    assert app.status == "manual_review"
    assert app.recommendation == expected["recommendation"]
    with factory() as s:
        checks = s.scalars(select(SourceCheck).where(SourceCheck.application_id == app_id)).all()
    assert len(checks) == 4


@pytest.mark.negative
def test_missing_consent_goes_to_needs_info(factory, new_application, process, expected) -> None:
    app_id = new_application("no_consent", submit=True)
    app = process(app_id)
    assert app.status == "needs_info"
    assert app.status_label == expected["needs_info"]["label"]
    assert _history_field(factory, app_id, "needs_info", StatusHistory.meta) == expected["needs_info"]["meta"]


@pytest.mark.negative
def test_bki_unavailable_goes_to_manual_review(new_application, process, sources, expected) -> None:
    sources.bki.set_dataset("timeout")
    app = process(new_application(submit=True))
    assert app.status == "manual_review"
    assert app.status_label == expected["labels"]["bki_unavailable"]
    assert app.recommendation is None


@pytest.mark.negative
def test_source_error_label_and_reason(factory, new_application, process, sources, expected) -> None:
    sources.bki.set_dataset("bad_request")
    app_id = new_application(submit=True)
    app = process(app_id)
    assert (app.status, app.status_label) == ("manual_review", expected["labels"]["source_error"])
    reason = _history_field(factory, app_id, "manual_review", StatusHistory.reason)
    assert reason == expected["source_error_reason"]


@pytest.mark.negative
def test_exception_moves_to_manual_review(new_application, process, broken_enrich, expected) -> None:
    app = process(new_application(submit=True), broken_enrich)
    assert app.status == "manual_review"
    assert app.status_label == expected["labels"]["processing_error"]


@pytest.mark.negative
def test_failing_fallback_does_not_escape(
    factory, new_application, broken_enrich, no_sleep, monkeypatch
) -> None:
    app_id = new_application(submit=True)
    assert worker.claim(factory) == [app_id]
    real = store.change_status

    def change_status(session, aid, to_status, *args, **kw):
        if to_status == "manual_review":
            raise RuntimeError("db down")
        return real(session, aid, to_status, *args, **kw)

    monkeypatch.setattr(store, "change_status", change_status)
    asyncio.run(process_application(factory, app_id, broken_enrich, 0, no_sleep))
    with factory() as s:
        assert store.get_application(s, app_id).status == "enrichment"


@pytest.mark.positive
def test_poll_claims_new_application_while_first_is_in_flight(factory, new_application, enrich) -> None:
    first = new_application(submit=True)

    async def run() -> int:
        gate = asyncio.Event()

        async def slow_enrich(inn, consent_id):
            await gate.wait()
            return await enrich(inn, consent_id)

        running: set[asyncio.Task] = set()
        assert await worker.poll(factory, slow_enrich, 0, running) == 1
        second = new_application(submit=True)
        assert await worker.poll(factory, slow_enrich, 0, running) == 1
        assert len(running) == 2
        gate.set()
        await asyncio.gather(*running)
        assert not running
        return second

    second = asyncio.run(run())
    with factory() as s:
        assert store.get_application(s, first).status == "manual_review"
        assert store.get_application(s, second).status == "manual_review"


@pytest.mark.negative
def test_recover_stuck_moves_interrupted_to_manual_review(factory, new_application, expected) -> None:
    stuck, waiting, fresh = (new_application(submit=True) for _ in range(3))
    with factory.begin() as s:
        store.change_status(s, stuck, "completeness_check", "picked")
        store.change_status(s, stuck, "enrichment", "ok")
        store.change_status(s, fresh, "completeness_check", "picked")
        s.execute(
            text("update applications set updated_at = now() - interval '5 minutes' where id = :i"),
            {"i": stuck},
        )
    assert worker.recover_stuck(factory) == 1
    with factory() as s:
        row = store.get_application(s, stuck)
        assert (row.status, row.status_label) == ("manual_review", expected["labels"]["interrupted"])
        assert store.get_application(s, waiting).status == "submitted"
        assert store.get_application(s, fresh).status == "completeness_check"
