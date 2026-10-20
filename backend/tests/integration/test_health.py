import pytest
from fastapi.testclient import TestClient


@pytest.mark.positive
def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
