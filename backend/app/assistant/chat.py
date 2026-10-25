from __future__ import annotations

import logging

import httpx
from sqlalchemy.orm import Session

from app.assistant.llm import LlmError, answer_by_llm
from app.assistant.rules import answer_by_rules
from app.assistant.settings import AssistantSettings, assistant_settings
from app.errors import ApiError
from app.models import User
from app.schemas.assistant import ChatRequest, ChatResponse

log = logging.getLogger(__name__)


def answer(
    db: Session,
    user: User,
    request: ChatRequest,
    settings: AssistantSettings | None = None,
    transport: httpx.BaseTransport | None = None,
) -> ChatResponse:
    settings = settings or assistant_settings
    if settings.mode == "rules" or (settings.mode == "auto" and not settings.ollama_url):
        return answer_by_rules(db, user, request)
    try:
        return answer_by_llm(db, user, request, settings, transport)
    except LlmError as error:
        if settings.mode == "llm":
            raise ApiError(503, "assistant_unavailable", "Ассистент временно недоступен") from error
        log.warning("assistant: LLM failed, using rules: %s", error)
        return answer_by_rules(db, user, request)
