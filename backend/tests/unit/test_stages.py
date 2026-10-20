import pytest

from app.db import statuses
from app.pipeline.stages import process_application

PAUSE = 0.25


@pytest.fixture
def process(run, factory, stage_store, enrich, sleeps):
    def go(app_id: int, enrich_fn=None) -> None:
        run(process_application(factory, app_id, enrich_fn or enrich, PAUSE, sleeps))

    return go


@pytest.fixture
def broken():
    async def broken(inn: str, consent_id: str):
        raise RuntimeError("boom")

    return broken


@pytest.mark.smoke
@pytest.mark.positive
def test_complete_application_goes_to_manual_review(process, stage_store, sleeps, expected) -> None:
    process(1)
    assert stage_store.statuses == ["enrichment", "scoring", "rules", "manual_review"]
    assert [c.reason for c in stage_store.changes] == [
        statuses.R_COMPLETE,
        statuses.R_SOURCES_CHECKED,
        statuses.R_SCORED,
        statuses.R_NO_RULES,
    ]
    assert stage_store.recommendations == [(1, expected["recommendation"])]
    assert sleeps.calls == [PAUSE] * 4


@pytest.mark.positive
def test_every_source_result_is_saved(process, stage_store, expected) -> None:
    process(1)
    assert [c[1] for c in stage_store.checks] == expected["sources"]
    assert {c[2] for c in stage_store.checks} == {"ok"}
    assert {c[0] for c in stage_store.checks} == {1}


@pytest.mark.positive
def test_each_status_change_has_its_own_transaction(process, factory) -> None:
    process(1)
    assert len(factory.sessions) == 4


@pytest.mark.negative
def test_incomplete_application_needs_info(process, stage_store, sources, expected) -> None:
    process(2)
    (change,) = stage_store.changes
    assert change.to_status == "needs_info"
    assert change.reason == statuses.R_INCOMPLETE
    assert change.meta == expected["needs_info"]["meta"]
    assert sources.bki.calls == []
    assert stage_store.checks == []


@pytest.mark.negative
def test_silent_source_sends_to_manual_review(process, stage_store, sources, expected) -> None:
    sources.bki.set_dataset("timeout")
    process(1)
    assert stage_store.statuses == ["enrichment", "manual_review"]
    last = stage_store.changes[-1]
    assert last.reason == statuses.R_SOURCE_SILENT
    assert last.meta == {"sources": ["bki"]}
    assert last.label == expected["labels"]["bki_unavailable"]
    assert len(stage_store.checks) == len(expected["sources"])
    assert stage_store.recommendations == []


@pytest.mark.negative
def test_source_error_sends_to_manual_review(process, stage_store, sources, expected) -> None:
    sources.fns.set_dataset("bad_request")
    process(1)
    last = stage_store.changes[-1]
    assert last.to_status == "manual_review"
    assert last.reason == expected["source_error_reason"]
    assert last.meta == {"sources": ["fns"]}
    assert last.label == expected["labels"]["source_error"]


@pytest.mark.negative
def test_crash_falls_back_to_manual_review(process, stage_store, broken, expected) -> None:
    process(1, broken)
    assert stage_store.statuses == ["enrichment", "manual_review"]
    last = stage_store.changes[-1]
    assert last.reason == expected["labels"]["interrupted"]
    assert last.label == expected["labels"]["processing_error"]


@pytest.mark.negative
def test_failing_fallback_is_swallowed(process, stage_store, broken) -> None:
    stage_store.fail_on = {"manual_review"}
    process(1, broken)  # must not raise
    assert stage_store.statuses == ["enrichment"]


@pytest.mark.negative
def test_unknown_application_falls_back_without_raising(process, stage_store) -> None:
    process(99)
    assert stage_store.statuses == ["manual_review"]
