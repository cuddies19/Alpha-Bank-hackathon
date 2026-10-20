import asyncio
from datetime import date

import pytest

from app.pipeline.scoring import build_features, get_score
from tests.source_mocks import load_json

URL = "http://score.test"


@pytest.fixture
def want() -> dict:
    return load_json("score_expected")


@pytest.fixture
def today(want) -> date:
    return date.fromisoformat(want["today"])


@pytest.fixture
def source_results(enrich, applications):
    return asyncio.run(enrich(applications["igor"]["inn"], applications["igor"]["consent_id"]))


@pytest.fixture
def score(sources, source_results, applications, today):
    def call(url: str = URL):
        return asyncio.run(
            get_score(
                applications["igor"]["inn"],
                results=source_results,
                scoring_url=url,
                timeout_s=3,
                attempts=3,
                pause_s=0,
                transport=sources.transport,
                today=today,
            )
        )

    return call


@pytest.mark.positive
def test_empty_url_gives_stub_without_http(score, sources, want) -> None:
    assert score("") == want["stub"]
    assert sources.score.calls == []


@pytest.mark.positive
def test_ds_ok(score, sources, want, applications) -> None:
    assert score() == want["ds_ok"]
    call = sources.score.calls[0]
    assert (call["method"], call["path"]) == ("POST", "/score")
    assert call["json"] == {"inn": applications["igor"]["inn"], "features": want["features"]}


@pytest.mark.positive
def test_recovers_on_second_attempt(score, sources, want) -> None:
    sources.score.set_dataset("flaky")
    assert score() == want["ds_flaky"]
    assert len(sources.score.calls) == 2


@pytest.mark.negative
@pytest.mark.parametrize("dataset", ["timeout", "error"])
def test_no_answer_is_unavailable_after_retries(score, sources, want, dataset) -> None:
    sources.score.set_dataset(dataset)
    res = score()
    assert (res["status"], res["source"], res["score"], res["risk_class"]) == (
        "unavailable",
        "ds",
        None,
        None,
    )
    assert res["message"] == want["timeout_message"]
    assert len(sources.score.calls) == 3


@pytest.mark.negative
def test_bad_request_not_retried(score, sources, want) -> None:
    sources.score.set_dataset("bad_request")
    res = score()
    assert (res["status"], res["message"]) == ("unavailable", want["bad_request_message"])
    assert len(sources.score.calls) == 1


@pytest.mark.negative
@pytest.mark.parametrize(
    "dataset",
    ["bad_json", "no_score", "lower_class", "unknown_class", "float", "bool", "list"],
)
def test_bad_body_is_unavailable(score, sources, want, dataset) -> None:
    sources.score.set_dataset(dataset)
    res = score()
    assert (res["status"], res["message"]) == ("unavailable", want["bad_body_message"])
    assert len(sources.score.calls) == 1


@pytest.mark.negative
def test_unexpected_error_is_unavailable(score, sources, want) -> None:
    sources.score.set_dataset("crash")
    res = score()
    assert (res["status"], res["message"]) == ("unavailable", want["crash_message"])


@pytest.mark.positive
def test_features_without_payloads(want, today) -> None:
    results = {s: {"payload": None} for s in ("egrul", "fns", "bki", "statement")}
    assert build_features(results, today) == want["empty_features"]


@pytest.mark.negative
def test_features_from_broken_data_do_not_raise(want, today) -> None:
    features = build_features(load_json("score_broken_results"), today)
    assert features == want["broken_features"]
