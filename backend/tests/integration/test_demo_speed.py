"""A speed set through /demo/speed is the one the worker uses for the next applications."""

import asyncio

import pytest

from app.api.demo import get_mocks
from app.db import get_db
from app.main import app
from app.pipeline import worker
from app.pipeline.demo import MocksAdmin
from tests.source_mocks import DEMO_ADMIN as DATA
from tests.source_mocks import FakeAdmin

PAUSE_S = 5.0
MULTIPLIER = 4


@pytest.fixture
def api(client, factory):
    """The app on the test database and a fake mocks admin."""
    mocks = MocksAdmin("http://mocks.test", FakeAdmin(DATA["modes"]).transport)

    def get_test_db():
        with factory() as db:
            yield db

    app.dependency_overrides[get_db] = get_test_db
    app.dependency_overrides[get_mocks] = lambda: mocks
    yield client
    client.post("/demo/reset")
    app.dependency_overrides.clear()


@pytest.mark.positive
def test_worker_uses_speed_from_api(api, factory, new_application, pauses) -> None:
    new_application(submit=True)
    assert api.post("/demo/speed", json={"multiplier": MULTIPLIER}).status_code == 200
    assert asyncio.run(worker.run_once(factory, None, PAUSE_S)) == 1
    assert pauses == [PAUSE_S / MULTIPLIER]
