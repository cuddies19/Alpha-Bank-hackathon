from __future__ import annotations

import json
import time
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.assistant import rules, tools
from app.assistant.settings import AssistantSettings
from app.errors import ApiError
from app.models import User
from app.schemas.assistant import ChatAction, ChatRequest, ChatResponse

MAX_ROUNDS = 4
SYSTEM_PROMPT = (
    "Ты ассистент кредитного кабинета для малого бизнеса. Отвечай по-русски, коротко "
    "(2-4 предложения). Все числа бери только из результатов инструментов, ничего не "
    "придумывай. Если данных нет, вызови подходящий инструмент или скажи, что не знаешь. "
    "Не обещай одобрение: решение принимает банк, расчёт предварительный."
)


class LlmError(Exception):
    pass


def param(kind: str, description: str) -> dict[str, str]:
    return {"type": kind, "description": description}


def tool_schema(
    name: str, description: str, properties: dict[str, dict[str, str]]
) -> dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {"type": "object", "properties": properties},
        },
    }


APPLICATION_ID = {"application_id": param("integer", "Номер заявки; без него берётся последняя")}
TOOL_SCHEMAS = [
    tool_schema("account_summary", "Компания клиента: остаток, денежный поток, кредиты", {}),
    tool_schema(
        "match_products",
        "Подобрать продукт под задачу бизнеса",
        {
            "task": param("string", "Задача бизнеса своими словами"),
            "amount": param("integer", "Сумма в рублях"),
            "term": param("integer", "Срок в месяцах"),
        },
    ),
    tool_schema(
        "calc_payment",
        "Посчитать ежемесячный платёж",
        {
            "amount": param("integer", "Сумма в рублях"),
            "term": param("integer", "Срок в месяцах"),
            "product_code": param("string", "Код продукта, например credit_line"),
        },
    ),
    tool_schema("application_status", "Статус заявки клиента", APPLICATION_ID),
    tool_schema("explain_decision", "Решение банка по заявке простыми словами", APPLICATION_ID),
    tool_schema("completeness_check", "Чего не хватает, чтобы отправить заявку", APPLICATION_ID),
]


def int_or_none(value: Any) -> int | None:
    return None if value in (None, "") else int(value)


def run_tool(db: Session, user: User, name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Run one tool asked by the model; bad arguments go back to the model as an error."""
    app_id = args.get("application_id")
    try:
        if name == "account_summary":
            return tools.account_summary(db, user)
        if name == "match_products":
            task = str(args.get("task", ""))
            return tools.match_products(
                db, task, int_or_none(args.get("amount")), int_or_none(args.get("term"))
            )
        if name == "calc_payment":
            code = args.get("product_code") or None
            return tools.calc_payment(db, int(args["amount"]), int(args["term"]), code)
        if name == "application_status":
            return tools.application_status(db, user, int_or_none(app_id))
        if name == "explain_decision":
            return tools.explain_decision(db, user, int_or_none(app_id))
        if name == "completeness_check":
            return tools.completeness_check(db, user, int_or_none(app_id))
    except (ApiError, KeyError, OverflowError, TypeError, ValueError) as error:
        return {"error": f"неверные аргументы: {error}"}
    return {"error": f"неизвестный инструмент {name}"}


def actions_for(name: str, result: dict[str, Any]) -> list[ChatAction]:
    if "error" in result:
        return []
    if name == "calc_payment" and result["ok"]:
        payload = {"amount": result["amount"], "term_months": result["term_months"]}
        return [rules.open_calculator(payload)]
    if name == "match_products" and result["items"]:
        best = result["items"][0]
        payload = {"amount": best["amount"], "term_months": best["term_months"]}
        return [rules.open_calculator(payload), rules.open_financing()]
    if name == "account_summary":
        return [rules.open_financing()]
    if name in ("application_status", "explain_decision", "completeness_check"):
        return [rules.open_application(result)] if result["found"] else []
    return []


def ask_model(
    client: httpx.Client, settings: AssistantSettings, messages: list[dict[str, Any]]
) -> dict[str, Any]:
    body = {
        "model": settings.model,
        "messages": messages,
        "tools": TOOL_SCHEMAS,
        "stream": False,
    }
    response = client.post(f"{settings.ollama_url.rstrip('/')}/api/chat", json=body)
    response.raise_for_status()
    return response.json()["message"]


def unique(actions: list[ChatAction]) -> list[ChatAction]:
    return list({action.type: action for action in actions}.values())


def answer_by_llm(
    db: Session,
    user: User,
    request: ChatRequest,
    settings: AssistantSettings,
    transport: httpx.BaseTransport | None = None,
) -> ChatResponse:
    question = request.message.strip()
    if request.application_id is not None:
        question += f"\n(Клиент смотрит заявку с id {request.application_id})"
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]
    actions: list[ChatAction] = []
    deadline = time.monotonic() + settings.timeout_s
    try:
        with httpx.Client(timeout=settings.timeout_s, transport=transport) as client:
            for _ in range(MAX_ROUNDS):
                if time.monotonic() >= deadline:
                    raise LlmError("модель не успела ответить за отведённое время")
                message = ask_model(client, settings, messages)
                calls = message.get("tool_calls")
                if not calls:
                    text = message["content"].strip()
                    if not text:
                        raise LlmError("пустой ответ модели")
                    return ChatResponse(
                        message=text, actions=unique(actions), suggestions=rules.SUGGESTIONS
                    )
                messages.append(message)
                for call in calls:
                    name = call["function"]["name"]
                    result = run_tool(db, user, name, call["function"].get("arguments") or {})
                    actions += actions_for(name, result)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_name": name,
                            "content": json.dumps(result, ensure_ascii=False),
                        }
                    )
    except (
        httpx.HTTPError,
        KeyError,
        OverflowError,
        TypeError,
        ValueError,
        AttributeError,
    ) as error:
        raise LlmError(str(error)) from error
    raise LlmError("модель не дала ответ за отведённое число шагов")
