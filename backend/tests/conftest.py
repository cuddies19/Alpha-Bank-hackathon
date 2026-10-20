import pytest

from app.pipeline.sources import enrich as real_enrich
from tests.source_mocks import Sources, load_json

TIMEOUT_S = 3
ATTEMPTS = 3


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    """Every test has exactly one of positive / negative."""
    bad = [
        item.nodeid
        for item in items
        if len({m.name for m in item.iter_markers()} & {"positive", "negative"}) != 1
    ]
    if bad:
        raise pytest.UsageError("need exactly one of positive/negative on: " + ", ".join(bad))


@pytest.fixture
def expected() -> dict:
    return load_json("expected")


@pytest.fixture
def applications() -> dict:
    return load_json("applications")


@pytest.fixture
def sources() -> Sources:
    return Sources()


@pytest.fixture
def enrich(sources):
    """The real enrich, talking to the source mocks."""

    async def enrich(inn: str, consent_id: str):
        return await real_enrich(
            inn, consent_id, "http://mocks.test", TIMEOUT_S, ATTEMPTS, 0, transport=sources.transport
        )

    return enrich
