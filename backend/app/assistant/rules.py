from __future__ import annotations

import re
from typing import Any

from sqlalchemy.orm import Session

from app.assistant import tools
from app.models import User
from app.schemas.assistant import ChatAction, ChatRequest, ChatResponse

SUGGESTIONS = [
    "Нужны деньги на закупку к распродаже",
    "Какой платёж будет при 3 млн на 18 месяцев?",
    "Что с моей заявкой?",
]
INTENTS = [
    ("account", ("баланс", "остаток", "денежный поток", "мои кредиты")),
    ("complete", ("не хватает", "готова ли", "можно отправить", "отправить заявк")),
    ("decision", ("почему", "отказ", "решени", "одобр", "причин")),
    # documents before status: "документы для заявки" is about documents.
    ("documents", ("документ", "справк", "выписк")),
    ("status", ("статус", "что с ", "заявк", "этап")),
    ("payment", ("платеж", "платёж", "рассчит", "посчит", "калькулятор")),
    ("finance", ("деньги", "денег", "кредит", "финанс", "закуп", "оборудован", "подобр")),
]
UNKNOWN = (
    "Опишите задачу бизнеса своими словами: на что нужны деньги и когда ждёте "
    "поступление. Я подберу продукт и покажу предварительный расчёт."
)
NO_PRODUCTS = (
    "Сейчас не удалось подобрать продукт. Попробуйте позже или откройте раздел финансирования."
)
NO_APPLICATION = "У вас пока нет заявок. Подберите финансирование, и я помогу её оформить."

AMOUNT_UNITS = re.compile(r"(\d{1,9}(?:[.,]\d{1,3})?)\s*(млн|миллион\w*|тыс\w*)")
AMOUNT_PLAIN = re.compile(r"\b(\d{1,3}(?:[  ]\d{3})+|\d{5,12})\b")
TERM_MONTHS = re.compile(r"(\d{1,4})\s*(?:мес\w*|м\b)")
TERM_YEARS = re.compile(r"(\d{1,3})\s*(?:лет|год\w*|г\b)")


def rub(value: int | float) -> str:
    return f"{round(value):,}".replace(",", " ") + " ₽"


def parse_amount(text: str) -> int | None:
    found = AMOUNT_UNITS.search(text)
    if found:
        number = float(found.group(1).replace(",", "."))
        return round(number * (1_000_000 if found.group(2).startswith("м") else 1_000))
    found = AMOUNT_PLAIN.search(text)
    if found:
        return int(re.sub(r"\D", "", found.group(1)))
    return None


def parse_term(text: str) -> int | None:
    found = TERM_MONTHS.search(text)
    if found:
        return int(found.group(1))
    found = TERM_YEARS.search(text)
    if found:
        return int(found.group(1)) * 12
    if "полгода" in text:
        return 6
    if re.search(r"\bгод\b|\bгода\b", text):
        return 12
    return None


def detect_intent(text: str) -> str | None:
    for name, words in INTENTS:
        if any(word in text for word in words):
            return name
    return None


def reply(message: str, actions: list[ChatAction] | None = None) -> ChatResponse:
    return ChatResponse(message=message, actions=actions or [], suggestions=SUGGESTIONS)


def open_financing() -> ChatAction:
    return ChatAction(type="open_financing", label="Подобрать финансирование")


def open_application(data: dict[str, Any]) -> ChatAction:
    return ChatAction(
        type="open_application", label="Открыть заявку", payload={"application_id": data["id"]}
    )


def open_calculator(payload: dict[str, Any] | None = None) -> ChatAction:
    return ChatAction(type="open_calculator", label="Открыть калькулятор", payload=payload or {})


def no_application() -> ChatResponse:
    return reply(NO_APPLICATION, [open_financing()])


def account_reply(db: Session, user: User) -> ChatResponse:
    data = tools.account_summary(db, user)
    if not data["found"]:
        return reply("Данные по компании доступны в кабинете клиента.")
    text = (
        f"{data['company']}: остаток на счёте {rub(data['balance'])}, "
        f"чистый поток в среднем {rub(data['avg_net_flow'])} в месяц."
    )
    if data["loans"]:
        text += f" Платежи по действующим кредитам: {rub(data['loan_payments'])} в месяц."
    else:
        text += " Действующих кредитов нет."
    return reply(text, [open_financing()])


def payment_reply(db: Session, text: str) -> ChatResponse:
    amount, term = parse_amount(text), parse_term(text)
    if amount is None or term is None:
        return reply(
            "Назовите сумму и срок, например: «3 млн на 18 месяцев», и я посчитаю платёж.",
            [open_calculator()],
        )
    items = tools.match_products(db, text, amount, term)["items"]
    if not items:
        return reply(NO_PRODUCTS, [open_calculator()])
    calc = tools.calc_payment(db, amount, term, items[0]["product_code"])
    if not calc["ok"]:
        return reply(calc["message"], [open_calculator()])
    answer = (
        f"{calc['product_name']}: {rub(amount)} на {term} мес. по ставке {calc['rate']:.1f}% "
        f"годовых — платёж около {rub(calc['monthly_payment'])} в месяц, "
        f"всего к возврату {rub(calc['total_payment'])}."
    )
    return reply(answer, [open_calculator({"amount": amount, "term_months": term})])


def finance_reply(db: Session, text: str) -> ChatResponse:
    items = tools.match_products(db, text, parse_amount(text), parse_term(text))["items"]
    if not items:
        return reply(NO_PRODUCTS, [open_financing()])
    best = items[0]
    answer = (
        f"Подойдёт {best['product_name']}: {rub(best['amount'])} на {best['term_months']} мес., "
        f"ставка {best['rate']:.1f}%, платёж около {rub(best['monthly_payment'])} в месяц. "
        "Это предварительная оценка."
    )
    payload = {"amount": best["amount"], "term_months": best["term_months"]}
    return reply(answer, [open_calculator(payload), open_financing()])


def status_reply(db: Session, user: User, application_id: int | None) -> ChatResponse:
    data = tools.application_status(db, user, application_id)
    if not data["found"]:
        return no_application()
    current = next((item["title"] for item in data["stages"] if item["status"] == "current"), None)
    answer = f"Заявка {data['number']}: {data['status_label']}."
    if current:
        answer += f" Сейчас этап: {current}."
    if data["decision"]:
        answer += f" Решение банка: {data['decision']['outcome_label']}."
    return reply(answer, [open_application(data)])


def decision_reply(db: Session, user: User, application_id: int | None) -> ChatResponse:
    data = tools.explain_decision(db, user, application_id)
    if not data["found"]:
        return no_application()
    if not data["has_decision"]:
        return reply(
            f"По заявке {data['number']} решения пока нет. Статус можно посмотреть в заявке.",
            [open_application(data)],
        )
    answer = f"Заявка {data['number']}: {data['outcome_label']}."
    if data["amount"]:
        answer += (
            f" Условия: {rub(data['amount'])} на {data['term_months']} мес., "
            f"платёж около {rub(data['monthly_payment'])} в месяц."
        )
    for part in (data["message"], data["decline_reason"]):
        if part:
            answer += f" {part}"
    if data["requested_documents"]:
        answer += " Нужны документы: " + ", ".join(data["requested_documents"]) + "."
    return reply(answer, [open_application(data)])


def complete_reply(db: Session, user: User, application_id: int | None) -> ChatResponse:
    data = tools.completeness_check(db, user, application_id)
    if not data["found"]:
        return no_application()
    if data["status"] != "draft":
        answer = f"Заявка {data['number']} уже отправлена в банк."
    elif data["ready"]:
        answer = f"Заявка {data['number']} заполнена, её можно отправлять."
    else:
        answer = "Чтобы отправить заявку, не хватает: " + ", ".join(data["missing"]) + "."
    return reply(answer, [open_application(data)])


def documents_reply(db: Session, user: User, application_id: int | None) -> ChatResponse:
    documents = tools.explain_decision(db, user, application_id).get("requested_documents")
    if documents:
        answer = "Банк запросил документы: " + ", ".join(documents) + "."
    else:
        answer = (
            "Обычно нужны отчётность и выписка по счёту. Если банку понадобится что-то ещё, "
            "список появится в статусе заявки."
        )
    return reply(answer, [ChatAction(type="open_documents", label="Мои документы")])


def answer_by_rules(db: Session, user: User, request: ChatRequest) -> ChatResponse:
    text = request.message.strip().lower()
    intent = detect_intent(text)
    app_id = request.application_id
    if intent == "account":
        return account_reply(db, user)
    if intent == "complete":
        return complete_reply(db, user, app_id)
    if intent == "decision":
        return decision_reply(db, user, app_id)
    if intent == "status":
        return status_reply(db, user, app_id)
    if intent == "payment":
        return payment_reply(db, text)
    if intent == "documents":
        return documents_reply(db, user, app_id)
    if intent == "finance":
        return finance_reply(db, text)
    return reply(UNKNOWN, [open_financing()])
