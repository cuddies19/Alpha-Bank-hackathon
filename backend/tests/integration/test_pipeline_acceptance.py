"""Acceptance for the pipeline: worker.run_once -> real enrich() on source mocks -> Postgres."""

import asyncio
import threading

import pytest
from sqlalchemy import select

from app.db import store
from app.db.models import SourceCheck, StatusHistory
from app.pipeline import worker

ATTEMPTS = 3


@pytest.fixture
def history(factory):
    def read(app_id: int) -> list[str]:
        with factory() as s:
            rows = s.scalars(
                select(StatusHistory).where(StatusHistory.application_id == app_id).order_by(StatusHistory.id)
            ).all()
        return [r.to_status for r in rows]

    return read


@pytest.fixture
def checks(factory):
    def read(app_id: int) -> dict[str, SourceCheck]:
        with factory() as s:
            rows = s.scalars(select(SourceCheck).where(SourceCheck.application_id == app_id)).all()
        return {r.source: r for r in rows}

    return read


@pytest.fixture
def application(factory):
    def read(app_id: int):
        with factory() as s:
            return store.get_application(s, app_id)

    return read


@pytest.mark.smoke
@pytest.mark.positive
def test_happy_path_walks_all_stages_to_manual_review(
    factory, new_application, enrich, application, history, checks, expected, applications
) -> None:
    app_id = new_application(submit=True)

    processed = asyncio.run(worker.run_once(factory, enrich, 0))

    assert processed == 1
    app = application(app_id)
    assert app.status == "manual_review"
    assert history(app_id)[-6:] == expected["history_happy"]
    found = checks(app_id)
    assert set(found) == set(expected["sources"])
    assert all(c.status == "ok" and c.payload for c in found.values())
    assert found["egrul"].payload["inn"] == applications["igor"]["inn"]
    assert app.recommendation is not None


@pytest.mark.smoke
@pytest.mark.negative
def test_bki_down_goes_to_manual_review_and_keeps_other_sources(
    factory, new_application, enrich, sources, application, history, checks, expected
) -> None:
    app_id = new_application(submit=True)
    sources.bki.set_dataset("timeout")

    asyncio.run(worker.run_once(factory, enrich, 0))

    app = application(app_id)
    assert app.status == "manual_review"
    assert app.status_label == expected["labels"]["bki_unavailable"]
    assert app.recommendation is None
    assert history(app_id)[-4:] == expected["history_bki_down"]
    assert "scoring" not in history(app_id)
    assert "rules" not in history(app_id)
    found = checks(app_id)
    assert set(found) == set(expected["sources"])
    assert found["bki"].status == "unavailable"
    assert found["bki"].message == expected["bki_unavailable_message"]
    assert found["bki"].attempts == ATTEMPTS
    assert len(sources.bki.calls) == ATTEMPTS
    for name in set(expected["sources"]) - {"bki"}:
        assert found[name].status == "ok"
        assert found[name].payload


@pytest.mark.negative
def test_bki_http_500_also_ends_in_manual_review(
    factory, new_application, enrich, sources, application, checks
) -> None:
    app_id = new_application(submit=True)
    sources.bki.set_dataset("error")

    asyncio.run(worker.run_once(factory, enrich, 0))

    app = application(app_id)
    assert app.status == "manual_review"
    assert app.recommendation is None
    assert checks(app_id)["bki"].status == "unavailable"


@pytest.mark.positive
def test_second_run_once_does_not_reprocess(factory, new_application, enrich) -> None:
    new_application(submit=True)

    assert asyncio.run(worker.run_once(factory, enrich, 0)) == 1
    assert asyncio.run(worker.run_once(factory, enrich, 0)) == 0


@pytest.mark.positive
def test_concurrent_workers_never_process_same_application_twice(
    factory, new_application, enrich, sources, history, checks
) -> None:
    ids = [new_application(submit=True) for _ in range(6)]
    counts: list[int] = []

    def run_worker() -> None:
        counts.append(asyncio.run(worker.run_once(factory, enrich, 0)))

    threads = [threading.Thread(target=run_worker) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert sum(counts) == len(ids)
    assert len(sources.bki.calls) == len(ids)  # each application enriched exactly once
    for app_id in ids:
        assert history(app_id).count("completeness_check") == 1
        assert history(app_id)[-1] == "manual_review"
        assert len(checks(app_id)) == 4
