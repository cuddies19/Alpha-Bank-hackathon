from types import SimpleNamespace

import pytest

from app.models import ApplicationStatus
from app.services.presenters import recommendation_for


def make_application(recommendation):
    return SimpleNamespace(
        status=ApplicationStatus.processing,
        recommendation=recommendation,
        latest_score=SimpleNamespace(risk_class="A", score=800),
        rule_results=[],
    )


@pytest.mark.positive
def test_saved_recommendation_is_used():
    application = make_application({"outcome": "counter", "reason": "меньше сумма"})
    assert recommendation_for(application) == ("counter", "меньше сумма")


@pytest.mark.negative
def test_empty_recommendation_falls_back_to_rules():
    outcome, _ = recommendation_for(make_application(None))
    assert outcome == "approve"
