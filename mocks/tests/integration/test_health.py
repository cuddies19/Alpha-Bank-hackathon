import pytest
from fastapi.testclient import TestClient


@pytest.mark.smoke
@pytest.mark.positive
def test_health(client: TestClient, data) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == data("health")["expected"]
