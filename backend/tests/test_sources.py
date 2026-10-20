import asyncio
import json

import httpx
import pytest

from app.pipeline.sources import enrich, unavailable_message

INN = "7701234567"


def run(handler, attempts=3):
    return asyncio.run(
        enrich(INN, "cns-1", "http://mocks", 3, attempts, 0, transport=httpx.MockTransport(handler))
    )


@pytest.mark.small
@pytest.mark.parametrize(
    ("source", "attempts", "timeout", "text"),
    [
        ("bki", 3, 3, "БКИ не ответило, 3 попытки по 3 с"),
        ("fns", 1, 2.5, "ФНС не ответила, 1 попытка по 2.5 с"),
        ("egrul", 5, 3, "ЕГРЮЛ не ответил, 5 попыток по 3 с"),
        ("statement", 11, 3, "Выписка не ответила, 11 попыток по 3 с"),
    ],
)
def test_message(source, attempts, timeout, text):
    assert unavailable_message(source, attempts, timeout) == text


@pytest.mark.medium
def test_all_ok():
    bodies = []

    def handler(request):
        if request.url.path == "/bki/report":
            bodies.append(json.loads(request.read()))
        return httpx.Response(200, json={"path": request.url.path})

    res = run(handler)
    assert bodies == [{"inn": INN, "consent_id": "cns-1"}]
    assert set(res) == {"egrul", "fns", "bki", "statement"}
    for source, r in res.items():
        assert r["status"] == "ok"
        assert r["attempts"] == 1
        assert r["payload"] is not None
        assert r["source"] == source


@pytest.mark.medium
def test_timeout_is_unavailable_and_others_ok():
    calls = []

    def handler(request):
        if request.url.path == "/bki/report":
            calls.append(1)
            raise httpx.ReadTimeout("slow", request=request)
        return httpx.Response(200, json={})

    res = run(handler)
    assert res["bki"]["status"] == "unavailable"
    assert res["bki"]["attempts"] == 3
    assert res["bki"]["payload"] is None
    assert res["bki"]["message"] == "БКИ не ответило, 3 попытки по 3 с"
    assert len(calls) == 3
    assert res["fns"]["status"] == "ok"


@pytest.mark.medium
def test_server_error_retries_then_unavailable():
    res = run(lambda request: httpx.Response(500, json={"detail": "source error"}), attempts=2)
    assert all(r["status"] == "unavailable" and r["attempts"] == 2 for r in res.values())


@pytest.mark.medium
def test_recovers_on_second_attempt():
    seen = {"n": 0}

    def handler(request):
        if request.url.path.startswith("/fns/"):
            seen["n"] += 1
            if seen["n"] == 1:
                return httpx.Response(500)
        return httpx.Response(200, json={"x": 1})

    res = run(handler)
    assert res["fns"]["status"] == "ok"
    assert res["fns"]["attempts"] == 2


@pytest.mark.medium
def test_bad_request_not_retried():
    res = run(lambda request: httpx.Response(422, json={"detail": "bad inn"}))
    assert all(r["status"] == "error" and r["attempts"] == 1 for r in res.values())
    assert all(r["message"] == "ФНС: некорректный запрос (HTTP 422)" for r in [res["fns"]])


@pytest.mark.medium
def test_unexpected_exception_is_error():
    def handler(request):
        raise RuntimeError("boom")

    res = run(handler)
    assert all(r["status"] == "error" for r in res.values())
    assert all(r["message"] == "Ошибка при запросе к источнику" for r in res.values())
