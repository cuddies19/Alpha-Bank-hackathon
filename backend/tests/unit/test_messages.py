import pytest

from app.pipeline.sources import unavailable_message
from tests.source_mocks import load_json


@pytest.mark.positive
@pytest.mark.parametrize("case", load_json("expected")["unavailable_messages"], ids=lambda c: c["source"])
def test_unavailable_message(case) -> None:
    assert unavailable_message(case["source"], case["attempts"], case["timeout"]) == case["text"]
