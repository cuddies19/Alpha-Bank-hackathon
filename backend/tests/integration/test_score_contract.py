"""Contract between the pipeline's scoring client and the real POST /score of the API."""

import asyncio
from datetime import date

import httpx
import pytest

from app.main import app
from app.pipeline.scoring import get_score


@pytest.fixture
def source_results(enrich, applications):
    return asyncio.run(enrich(applications["igor"]["inn"], applications["igor"]["consent_id"]))


@pytest.fixture
def score(source_results, applications):
    def call():
        return asyncio.run(
            get_score(
                applications["igor"]["inn"],
                results=source_results,
                scoring_url="http://api.test",
                timeout_s=3,
                attempts=1,
                pause_s=0,
                transport=httpx.ASGITransport(app=app),
                today=date(2026, 10, 25),
            )
        )

    return call


@pytest.mark.positive
@pytest.mark.smoke
def test_real_score_accepts_pipeline_features(score) -> None:
    res = score()
    assert res["status"] == "ok", res["message"]
    assert 300 <= res["score"] <= 850
    assert res["risk_class"] in ("A", "B", "C", "D", "E")
