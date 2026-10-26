from datetime import date

import pytest

from app.rules.dates import months_between
from tests.source_mocks import load_json


@pytest.mark.positive
@pytest.mark.parametrize(
    "case", load_json("months_cases"), ids=lambda c: f"{c['start']}-{c['today']}"
)
def test_months_between(case) -> None:
    assert months_between(case["start"], date.fromisoformat(case["today"])) == case["months"]
