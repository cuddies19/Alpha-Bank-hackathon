import asyncio

import pytest


@pytest.fixture
def run(enrich, applications):
    inn = applications["igor"]["inn"]
    consent_id = applications["igor"]["consent_id"]
    return lambda: asyncio.run(enrich(inn, consent_id))


@pytest.mark.positive
def test_all_ok(run, sources, expected) -> None:
    res = run()
    assert [c["json"] for c in sources.bki.calls] == [expected["bki_request"]]
    assert set(res) == set(expected["sources"])
    for source, r in res.items():
        assert r["status"] == "ok"
        assert r["attempts"] == 1
        assert r["payload"] is not None
        assert r["source"] == source


@pytest.mark.negative
def test_timeout_is_unavailable_and_others_ok(run, sources, expected) -> None:
    sources.bki.set_dataset("timeout")
    res = run()
    assert res["bki"]["status"] == "unavailable"
    assert res["bki"]["attempts"] == 3
    assert res["bki"]["payload"] is None
    assert res["bki"]["message"] == expected["bki_unavailable_message"]
    assert len(sources.bki.calls) == 3
    assert res["fns"]["status"] == "ok"


@pytest.mark.negative
def test_server_error_retries_then_unavailable(run, sources) -> None:
    sources.set_all("error")
    res = run()
    assert all(r["status"] == "unavailable" and r["attempts"] == 3 for r in res.values())


@pytest.mark.positive
def test_recovers_on_second_attempt(run, sources) -> None:
    sources.fns.set_dataset("flaky")
    res = run()
    assert res["fns"]["status"] == "ok"
    assert res["fns"]["attempts"] == 2


@pytest.mark.negative
def test_bad_request_not_retried(run, sources, expected) -> None:
    sources.set_all("bad_request")
    res = run()
    assert all(r["status"] == "error" and r["attempts"] == 1 for r in res.values())
    assert res["fns"]["message"] == expected["bad_request_message"]


@pytest.mark.negative
def test_unexpected_exception_is_error(run, sources, expected) -> None:
    sources.set_all("crash")
    res = run()
    assert all(r["status"] == "error" for r in res.values())
    assert all(r["message"] == expected["unexpected_message"] for r in res.values())


@pytest.mark.negative
def test_non_json_answer_becomes_error_for_that_source(run, sources, expected) -> None:
    sources.bki.set_dataset("bad_json")
    res = run()
    assert res["bki"]["status"] == "error"
    assert res["bki"]["attempts"] == 0
    assert res["bki"]["latency_ms"] == 0
    assert res["bki"]["payload"] is None
    assert res["bki"]["message"] == expected["unexpected_message"]
    assert res["fns"]["status"] == "ok"
