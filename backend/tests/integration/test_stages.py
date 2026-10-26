import asyncio

import pytest
from sqlalchemy import select

from app.models import Application, ApplicationStatus, StatusHistory, User
from app.pipeline import worker
from app.pipeline.stages import process_application
from app.state.machine import actor_from_user, transition


@pytest.fixture
def process(factory, enrich, no_sleep):
    """Claim the application and run it; returns the application afterwards."""

    def run(app_id: int, enrich_with=None):
        assert worker.claim(factory) == [app_id]
        asyncio.run(process_application(factory, app_id, enrich_with or enrich, 0, no_sleep))
        with factory() as s:
            return s.get(Application, app_id)

    return run


@pytest.fixture
def history_comments(factory):
    def read(app_id: int, to_status: str) -> list[str]:
        with factory() as s:
            return list(
                s.scalars(
                    select(StatusHistory.comment).where(
                        StatusHistory.application_id == app_id,
                        StatusHistory.to_status == ApplicationStatus(to_status),
                    )
                )
            )

    return read


@pytest.fixture
def broken_enrich():
    async def enrich(inn, consent_id):
        raise RuntimeError("boom")

    return enrich


@pytest.fixture
def withdrawing_enrich(factory, enrich):
    """An enrich that gets the client to withdraw the application while it runs."""

    async def withdraw(inn, consent_id):
        with factory.begin() as s:
            app = s.scalar(select(Application).where(Application.number == consent_id))
            user = s.get(User, app.created_by_id)
            transition(s, app, ApplicationStatus.withdrawn, actor_from_user(user))
        return await enrich(inn, consent_id)

    return withdraw


@pytest.mark.positive
def test_claim_comment_is_saved(new_application, process, history_comments, expected) -> None:
    app_id = new_application(submit=True)
    process(app_id)
    assert history_comments(app_id, "processing") == [expected["claimed_comment"]]


@pytest.mark.positive
def test_happy_path_ends_in_manual_review(new_application, process, expected) -> None:
    app = process(new_application(submit=True))
    assert app.status == "manual_review"
    assert app.recommendation == expected["igor_recommendation"]
    assert app.labels == []


@pytest.mark.negative
def test_missing_consent_goes_to_the_client(
    new_application, process, history_comments, expected
) -> None:
    app_id = new_application("no_consent", submit=True)
    app = process(app_id)
    assert app.status == "client_action"
    assert history_comments(app_id, "client_action") == [expected["incomplete_rows"][1]["text"]]


@pytest.mark.negative
def test_bki_unavailable_goes_to_manual_review(
    new_application, process, sources, history_comments, expected
) -> None:
    sources.bki.set_dataset("timeout")
    app_id = new_application(submit=True)
    app = process(app_id)
    assert app.status == "manual_review"
    assert app.labels == [expected["labels"]["bki_unavailable"]]
    assert history_comments(app_id, "manual_review") == [expected["source_silent_reason"]]


@pytest.mark.negative
def test_source_error_goes_to_manual_review(
    new_application, process, sources, history_comments, expected
) -> None:
    sources.fns.set_dataset("bad_request")
    app_id = new_application(submit=True)
    app = process(app_id)
    assert (app.status, app.labels) == ("manual_review", [expected["labels"]["source_error"]])
    assert history_comments(app_id, "manual_review") == [expected["source_error_reason"]]


@pytest.mark.negative
def test_crash_goes_to_manual_review(
    new_application, process, broken_enrich, history_comments, expected
) -> None:
    app_id = new_application(submit=True)
    app = process(app_id, broken_enrich)
    assert app.status == "manual_review"
    assert app.labels == [expected["labels"]["processing_error"]]
    assert history_comments(app_id, "manual_review") == [expected["interrupted_comment"]]


@pytest.mark.negative
def test_withdrawn_while_processing_stays_withdrawn(
    new_application, process, withdrawing_enrich
) -> None:
    app = process(new_application(submit=True), withdrawing_enrich)
    assert app.status == "withdrawn"
    assert app.recommendation is None


@pytest.mark.positive
def test_interrupted_application_is_processed_again(
    factory, new_application, enrich, no_sleep
) -> None:
    app_id = new_application(submit=True)
    assert worker.claim(factory) == [app_id]  # the worker "crashed" here
    assert worker.recover_stuck(factory) == [app_id]

    asyncio.run(process_application(factory, app_id, enrich, 0, no_sleep))

    with factory() as s:
        assert s.get(Application, app_id).status == "manual_review"
