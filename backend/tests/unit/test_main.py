import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.mark.smoke
@pytest.mark.positive
def test_health_ok(client, unit) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == unit["health"]


@pytest.mark.negative
def test_unknown_path_is_404(client) -> None:
    assert client.get("/nope").status_code == 404


@pytest.mark.negative
def test_health_rejects_post(client) -> None:
    assert client.post("/health").status_code == 405
