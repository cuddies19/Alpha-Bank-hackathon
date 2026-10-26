from __future__ import annotations


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_openapi_contains_contract(client):
    schema = client.get("/openapi.json").json()
    paths = schema["paths"]
    for path in (
        "/auth/login",
        "/me",
        "/me/cashflow",
        "/products",
        "/recommendations",
        "/calculator",
        "/applications",
        "/applications/{application_id}/submit",
        "/loans",
        "/notifications",
        "/bank/applications",
        "/bank/applications/{application_id}/decision",
        "/bank/audit",
        "/bank/sources",
        "/assistant/chat",
        "/demo/state",
    ):
        assert path in paths, path
