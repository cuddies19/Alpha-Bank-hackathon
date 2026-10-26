import asyncio
import time

import pytest

from app.pipeline import worker


@pytest.mark.positive
def test_trigger_fires_on_insert_and_status_change_only(
    trigger_count, insert_application, change_status, touch_application, notified
) -> None:
    assert trigger_count() == 1

    draft_id = insert_application("draft")
    assert notified(lambda: insert_application("draft")) == []
    assert notified(lambda: change_status(draft_id, "submitted")) == [str(draft_id)]
    assert notified(lambda: touch_application(draft_id)) == []
    assert len(notified(lambda: insert_application("submitted"))) == 1


@pytest.mark.smoke
@pytest.mark.positive
def test_notification_wakes_waiting_worker(server, insert_application) -> None:
    async def scenario() -> float:
        await server.start()
        await asyncio.wait_for(server.polled.wait(), 5)  # start poll done, now listening
        server.polled.clear()
        started = time.monotonic()
        app_id = insert_application("submitted")
        await asyncio.wait_for(server.polled.wait(), 5)
        elapsed = time.monotonic() - started
        await server.finish()
        assert server.claimed == [app_id]
        return elapsed

    assert worker.run(scenario()) < 1


@pytest.mark.positive
def test_application_inserted_before_start_is_claimed(server, insert_application) -> None:
    app_id = insert_application("submitted")

    async def scenario() -> list[int]:
        await server.start()
        await asyncio.wait_for(server.polled.wait(), 5)
        await server.finish()
        return server.claimed

    assert worker.run(scenario()) == [app_id]


@pytest.mark.negative
def test_application_inserted_while_reconnecting_is_claimed(
    server, insert_application, kill_listener
) -> None:
    async def scenario() -> None:
        await server.start()
        await asyncio.wait_for(server.polled.wait(), 5)  # listening
        assert kill_listener() == 1
        app_id = insert_application("submitted")
        while app_id not in server.claimed:  # claimed by the poll after the reconnect
            server.polled.clear()
            await asyncio.wait_for(server.polled.wait(), 5)
        await server.finish()
        assert server.claimed == [app_id]

    worker.run(scenario())
