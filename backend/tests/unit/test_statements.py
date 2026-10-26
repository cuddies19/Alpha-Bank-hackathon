import httpx
import pytest

from app.services import statements
from tests.source_mocks import load_json

STATEMENT = load_json("statement_igor")["body"]


@pytest.mark.positive
def test_fetch_reads_twelve_months_from_the_source() -> None:
    def handle(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/statement/7701234567"
        assert request.url.params["months"] == "12"
        return httpx.Response(200, json=STATEMENT)

    payload = statements.fetch("7701234567", transport=httpx.MockTransport(handle))

    assert payload is not None
    assert payload["avg_net_flow_rub"] == 610_000
    assert len(payload["months"]) == 12


@pytest.mark.negative
def test_fetch_returns_none_when_the_source_fails() -> None:
    def handle(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"detail": "source error"})

    assert statements.fetch("7701234567", transport=httpx.MockTransport(handle)) is None
