from contextlib import contextmanager

import httpx
import pytest

from app.pipeline import demo, worker
from app.pipeline.demo import DemoSettings, MocksAdmin, MocksUnavailable
from tests.source_mocks import DEMO_ADMIN, FakeAdmin
from tests.unit.fakes import FakeSession

DATA = DEMO_ADMIN


@pytest.fixture
def admin() -> FakeAdmin:
    return FakeAdmin(DATA["modes"])


@pytest.fixture
def mocks(admin) -> MocksAdmin:
    return MocksAdmin("http://mocks.test/", admin.transport)


@pytest.fixture
def broken_mocks():
    """Mocks that fail in the named way: down, error, bad_json."""

    def make(kind: str) -> MocksAdmin:
        def handle(request: httpx.Request) -> httpx.Response:
            if kind == "down":
                raise httpx.ConnectError("refused", request=request)
            if kind == "error":
                return httpx.Response(500)
            return httpx.Response(200, text="not json")

        return MocksAdmin("http://mocks.test", httpx.MockTransport(handle))

    return make


class SpeedFactory:
    """Stands in for sessionmaker; every session knows the given speed."""

    def __init__(self, speed: float | None) -> None:
        self.rows = {} if speed is None else {1: DemoSettings(id=1, speed_multiplier=speed)}

    @contextmanager
    def begin(self):
        yield FakeSession(rows=self.rows)


@pytest.mark.positive
def test_statuses_follow_mock_modes(mocks, admin) -> None:
    assert mocks.statuses() == DATA["statuses"]
    assert admin.calls == [("GET", "/_admin/sources", None)]


@pytest.mark.negative
def test_statuses_unknown_mode_is_unavailable(admin, mocks) -> None:
    admin.modes = DATA["unknown_mode"]
    assert mocks.statuses() == DATA["all_unavailable"]


@pytest.mark.negative
@pytest.mark.parametrize("kind", ["down", "error", "bad_json"])
def test_statuses_when_mocks_fail(broken_mocks, kind) -> None:
    assert broken_mocks(kind).statuses() == DATA["all_unavailable"]


@pytest.mark.positive
@pytest.mark.parametrize("case", DATA["set_status"], ids=lambda c: c["body"]["mode"])
def test_set_status_sends_mode(mocks, admin, case) -> None:
    mocks.set_status("bki", case["status"], case["latency_ms"])
    assert admin.calls == [("POST", "/_admin/sources/bki", case["body"])]


@pytest.mark.positive
def test_reset(mocks, admin) -> None:
    mocks.reset()
    assert admin.calls == [("POST", "/_admin/sources/_reset", None)]


@pytest.mark.negative
@pytest.mark.parametrize("kind", ["down", "error", "bad_json"])
def test_set_status_when_mocks_fail(broken_mocks, kind) -> None:
    with pytest.raises(MocksUnavailable):
        broken_mocks(kind).set_status("bki", "fail", None)


@pytest.mark.positive
def test_speed_default_is_one(empty_db) -> None:
    assert demo.get_speed(empty_db) == 1.0


@pytest.fixture
def empty_db() -> FakeSession:
    return FakeSession()


@pytest.fixture
def db_with_row() -> FakeSession:
    return FakeSession(rows={1: DemoSettings(id=1, speed_multiplier=2.0)})


@pytest.mark.negative
@pytest.mark.parametrize("stored", [0, -1.0])
def test_speed_not_positive_is_one(stored) -> None:
    db = FakeSession(rows={1: DemoSettings(id=1, speed_multiplier=stored)})
    assert demo.get_speed(db) == 1.0


@pytest.mark.positive
def test_set_speed_creates_the_row(empty_db) -> None:
    demo.set_speed(empty_db, 3.0)
    row = empty_db.added[0]
    assert (row.id, row.speed_multiplier) == (1, 3.0)


@pytest.mark.positive
def test_set_speed_updates_the_row(db_with_row) -> None:
    demo.set_speed(db_with_row, 5.0)
    assert db_with_row.added == []
    assert demo.get_speed(db_with_row) == 5.0


@pytest.mark.positive
@pytest.mark.parametrize(("speed", "pause"), [(None, 5.0), (1.0, 5.0), (4.0, 1.25)])
def test_worker_divides_pause_by_speed(run, pauses, speed, pause) -> None:
    async def go() -> None:
        running: set = set()
        worker.start(SpeedFactory(speed), [1, 2], None, 5.0, running)
        for task in list(running):
            await task

    run(go())
    assert pauses == [pause, pause]


@pytest.mark.positive
def test_worker_start_without_ids_reads_nothing(run, pauses) -> None:
    class NoDb:
        def begin(self):
            raise AssertionError("db must not be used")

    async def go() -> None:
        worker.start(NoDb(), [], None, 5.0, set())

    run(go())
    assert pauses == []
