from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.assistant.chat import answer
from app.db import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas.assistant import ChatRequest, ChatResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    """Ассистент: отвечает на вопросы клиента, числа берёт из сервисов банка."""
    return answer(db, user, payload)
