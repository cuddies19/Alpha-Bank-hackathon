from __future__ import annotations

from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models import User
from app.schemas.assistant import ChatAction, ChatRequest, ChatResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, _: User = Depends(get_current_user)) -> ChatResponse:
    """Контрактная заглушка. Полноценный ассистент — зона Интеграций."""
    text = payload.message.strip()
    lowered = text.lower()
    if any(word in lowered for word in ("сумм", "сколько", "платеж", "платёж")):
        message = (
            "Платёж зависит от суммы, срока и ставки. Откройте калькулятор: я подставлю "
            "параметры из вашей задачи и покажу нагрузку на денежный поток."
        )
        actions = [ChatAction(type="open_calculator", label="Открыть калькулятор")]
    elif any(word in lowered for word in ("документ", "справк", "выписк")):
        message = (
            "Для кредитной заявки обычно нужны отчётность за последний год и выписка "
            "по счёту за 6 месяцев. Точный список появится в статусе заявки."
        )
        actions = [ChatAction(type="open_documents", label="Мои документы")]
    else:
        message = (
            "Опишите задачу бизнеса своими словами: на что нужны деньги и когда ждёте "
            "поступление. Я подберу продукт и покажу предварительный расчёт."
        )
        actions = [ChatAction(type="open_financing", label="Подобрать финансирование")]
    return ChatResponse(
        message=message,
        suggestions=[
            "Нужны деньги на закупку к распродаже",
            "Какой платёж будет при 3 млн на 18 месяцев?",
            "Какие документы понадобятся?",
        ],
        actions=actions,
    )
