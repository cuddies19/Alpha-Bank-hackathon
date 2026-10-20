from datetime import date

import pytest

from app.db import statuses
from app.pipeline import stages
from app.pipeline.stages import process_application
from tests.unit.conftest import TODAY

PAUSE = 0.25


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
    process(1)
    assert stage_store.statuses == ["enrichment", "scoring", "rules", "manual_review"]
    reasons = [c.reason for c in stage_store.changes]
    assert reasons[:3] == [statuses.R_COMPLETE, statuses.R_SOURCES_CHECKED, statuses.R_SCORED]
    assert reasons[3] == expected["igor_explanation"]
    assert stage_store.changes[2].meta == expected["recommendation"]
    assert stage_store.changes[3].meta == {"failed": ["payment_share"]}
    assert stage_store.changes[3].label is None
    assert sleeps.calls == [PAUSE] * 4


@pytest.mark.positive
def test_rules_result_and_recommendation_are_saved(process, stage_store, expected) -> None:
    process(1)
    ((app_id, rows),) = stage_store.rule_results
    assert app_id == 1
    assert [r["code"] for r in rows if not r["passed"]] == ["payment_share"]
    assert stage_store.recommendations == [(1, expected["igor_recommendation"])]


@pytest.mark.positive
def test_rules_get_the_application_and_the_injected_date(
    process, stage_store, monkeypatch, applications
) -> None:
    seen = {}

    def evaluate(application, sources, score, rules, today):
        seen.update(application=application, score=score, today=today)
        return real_evaluate(application, sources, score, rules, today)

    real_evaluate = stages.evaluate
    monkeypatch.setattr(stages, "evaluate", evaluate)
    process(1, today=lambda: date(2026, 1, 2))
    igor = applications["igor"]
    assert seen["application"] == {k: igor[k] for k in ("product", "amount_rub", "term_months", "documents")}
    assert seen["score"] == {"risk_class": "B"}
    assert seen["today"] == date(2026, 1, 2)


@pytest.mark.positive
def test_rejected_uses_client_reason_as_label_and_reason(process, stage_store, sources, expected) -> None:
    sources.egrul.set_dataset("liquidating")
    process(1)
    last = stage_store.changes[-1]
    assert last.to_status == "rejected"
    assert last.reason == last.label == expected["rejected_reason"]
    assert stage_store.recommendations[0][1]["kind"] == "none"


@pytest.mark.negative
def test_scoring_unavailable_goes_to_manual_review(process, stage_store) -> None:
    async def down(inn, results):
        return {"status": "unavailable", "message": "Скоринг не ответил"}

    process(1, score=down)
    assert stage_store.statuses == ["enrichment", "scoring", "manual_review"]
    last = stage_store.changes[-1]
    assert (last.reason, last.label) == ("Скоринг не ответил", statuses.L_SCORING_DOWN)
    assert stage_store.recommendations == []
    assert stage_store.rule_results == []


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
