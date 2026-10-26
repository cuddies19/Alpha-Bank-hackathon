import httpx
import pytest
from fastapi.testclient import TestClient

from app.api.demo import get_mocks
from app.config import Settings, get_settings
from app.db import get_db
from app.main import app
from app.pipeline import demo
from app.pipeline.demo import MocksAdmin
from tests.source_mocks import DEMO_ADMIN as DATA
from tests.source_mocks import FakeAdmin

APPLICATIONS = 7


class FakeDb:
    """Enough of Session for the /demo endpoints."""

    def __init__(self) -> None:
        self.rows: dict = {}
        self.commits = 0

    def get(self, model, key):
        return self.rows.get(key)

    def add(self, obj) -> None:
        self.rows[obj.id] = obj

    def scalar(self, stmt) -> int:
        return APPLICATIONS

    def commit(self) -> None:
        self.commits += 1


@pytest.fixture
def db() -> FakeDb:
    return FakeDb()


@pytest.fixture
def admin() -> FakeAdmin:
    return FakeAdmin(DATA["modes"])


@pytest.fixture
def api(db, admin):
    """TestClient on a fake db and a fake mocks admin."""
    mocks = MocksAdmin("http://mocks.test", admin.transport)
    saved = dict(app.dependency_overrides)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_mocks] = lambda: mocks
    yield TestClient(app)
    app.dependency_overrides.clear()
    app.dependency_overrides.update(saved)


@pytest.fixture
def prod_env(api):
    """Run the app as if APP_ENV=prod."""
    app.dependency_overrides[get_settings] = lambda: Settings(app_env="prod", jwt_secret="x" * 32)


@pytest.fixture
def mocks_down(api):
    """Make the mocks admin unreachable."""

    def refuse(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("refused", request=request)

    mocks = MocksAdmin("http://mocks.test", httpx.MockTransport(refuse))
    app.dependency_overrides[get_mocks] = lambda: mocks


@pytest.mark.positive
@pytest.mark.smoke
def test_state(api) -> None:
    body = api.get("/demo/state").json()
    assert body["sources"] == DATA["statuses"]
    assert (body["speed"], body["applications"]) == (1.0, APPLICATIONS)


@pytest.mark.positive
def test_state_when_mocks_down(api, mocks_down) -> None:
    response = api.get("/demo/state")
    assert response.status_code == 200
    assert response.json()["sources"] == DATA["all_unavailable"]


@pytest.mark.positive
def test_set_source_goes_to_mocks(api, admin) -> None:
    response = api.post("/demo/sources/bki", json={"status": "warn", "latency_ms": 900})
    assert response.status_code == 200
    assert admin.calls[0] == ("POST", "/_admin/sources/bki", {"mode": "slow", "delay_ms": 900})


@pytest.mark.positive
def test_set_source_without_status_changes_nothing(api, admin) -> None:
    assert api.post("/demo/sources/bki", json={}).status_code == 200
    assert [call[0] for call in admin.calls] == ["GET"]


@pytest.mark.negative
def test_unknown_source(api) -> None:
    response = api.post("/demo/sources/unknown", json={"status": "fail"})
    assert (response.status_code, response.json()["code"]) == (404, "source_not_found")


@pytest.mark.negative
def test_invalid_status(api) -> None:
    response = api.post("/demo/sources/bki", json={"status": "bad"})
    assert (response.status_code, response.json()["code"]) == (422, "invalid_source_status")


@pytest.mark.negative
def test_set_source_when_mocks_down(api, mocks_down) -> None:
    response = api.post("/demo/sources/bki", json={"status": "fail"})
    assert (response.status_code, response.json()["code"]) == (503, "mocks_unavailable")


@pytest.mark.positive
def test_set_speed(api, db) -> None:
    response = api.post("/demo/speed", json={"multiplier": 3})
    assert response.json()["speed"] == 3.0
    assert (demo.get_speed(db), db.commits) == (3.0, 1)


@pytest.mark.positive
def test_reset(api, db, admin) -> None:
    api.post("/demo/speed", json={"multiplier": 3})
    response = api.post("/demo/reset")
    assert response.status_code == 200
    assert response.json()["speed"] == 1.0
    assert ("POST", "/_admin/sources/_reset", None) in admin.calls


@pytest.mark.negative
def test_reset_when_mocks_down(api, db, mocks_down) -> None:
    response = api.post("/demo/reset")
    assert (response.status_code, response.json()["code"]) == (503, "mocks_unavailable")
    assert db.commits == 0


@pytest.mark.positive
def test_default_mocks_client_uses_settings() -> None:
    assert get_mocks().url.endswith("/_admin/sources")


@pytest.mark.negative
def test_demo_hidden_outside_dev(api, prod_env) -> None:
    assert api.get("/demo/state").status_code == 404
    assert api.post("/demo/reset").status_code == 404
