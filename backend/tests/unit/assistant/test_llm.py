import logging

import pytest

from app.assistant.chat import answer
from app.assistant.rules import UNKNOWN
from app.errors import ApiError
from app.schemas.assistant import ChatRequest
from tests.source_mocks import load_json

DATA = load_json("assistant_llm")
ANSWERS = [pytest.param(case, id=case["name"]) for case in DATA["answers"]]
FAILURES = [pytest.param(case, id=case["name"]) for case in DATA["failures"]]


def tool_messages(requests: list[dict]) -> str:
    last = requests[-1]["messages"]
    return " ".join(item["content"] for item in last if item["role"] == "tool")


@pytest.mark.positive
@pytest.mark.parametrize("case", ANSWERS)
def test_llm_answer(case, db, users, add_applications, drop_products, ollama, make_settings):
    ids = add_applications(case.get("apps", []))
    if case.get("no_products"):
        drop_products()
    app_id = next(iter(ids.values())) if case.get("application_id") else None
    transport, requests = ollama(case["replies"])
    request = ChatRequest(message=case["message"], application_id=app_id)

    response = answer(db, users["igor.sokolov"], request, make_settings("auto"), transport)

    assert response.message == case["text"]
    assert [action.type for action in response.actions] == case["actions"]
    assert len(response.suggestions) == 3
    assert len(requests) == 2
    for text in case["tool_results"]:
        assert text in tool_messages(requests)


@pytest.mark.positive
def test_llm_request_shape(db, users, ollama, make_settings, llm_data):
    transport, requests = ollama(llm_data["answers"][0]["replies"])

    answer(
        db,
        users["igor.sokolov"],
        ChatRequest(message=DATA["plain_message"]),
        make_settings("auto"),
        transport,
    )

    first = requests[0]
    assert first["model"] == "test-model"
    assert first["stream"] is False
    assert len(first["tools"]) == 6
    assert [item["role"] for item in first["messages"]] == ["system", "user"]


@pytest.mark.positive
@pytest.mark.parametrize("case", FAILURES)
def test_auto_falls_back_to_rules(case, db, users, ollama, make_settings, caplog):
    transport, _ = ollama(case["replies"])

    with caplog.at_level(logging.WARNING):
        response = answer(
            db,
            users["igor.sokolov"],
            ChatRequest(message=DATA["plain_message"]),
            make_settings("auto"),
            transport,
        )

    assert response.message == UNKNOWN
    assert "using rules" in caplog.text


@pytest.mark.negative
@pytest.mark.parametrize("case", FAILURES)
def test_llm_mode_error_is_503(case, db, users, ollama, make_settings):
    transport, _ = ollama(case["replies"])

    with pytest.raises(ApiError) as error:
        answer(
            db,
            users["igor.sokolov"],
            ChatRequest(message=DATA["plain_message"]),
            make_settings("llm"),
            transport,
        )

    assert error.value.status_code == 503
    assert error.value.code == "assistant_unavailable"


@pytest.mark.positive
@pytest.mark.parametrize("name", ["rules_with_url", "auto_no_url"])
def test_rules_without_llm(name, db, users, ollama, make_settings):
    transport, requests = ollama([])

    response = answer(
        db,
        users["igor.sokolov"],
        ChatRequest(message=DATA["plain_message"]),
        make_settings(name),
        transport,
    )

    assert response.message == UNKNOWN
    assert requests == []


@pytest.mark.positive
def test_deadline_falls_back_before_asking(db, users, ollama, make_settings):
    transport, requests = ollama([])

    response = answer(
        db,
        users["igor.sokolov"],
        ChatRequest(message=DATA["plain_message"]),
        make_settings("zero_timeout"),
        transport,
    )

    assert response.message == UNKNOWN
    assert requests == []
