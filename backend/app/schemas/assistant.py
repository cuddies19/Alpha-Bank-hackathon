from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    screen: str | None = None
    application_id: int | None = None


class ChatAction(BaseModel):
    type: str
    label: str
    payload: dict[str, Any] = {}


class ChatResponse(BaseModel):
    message: str
    suggestions: list[str] = []
    actions: list[ChatAction] = []
    disclaimer: str = "Предварительная оценка. Кредитное решение принимает банк."


class DemoSourceRequest(BaseModel):
    status: str | None = None
    latency_ms: int | None = Field(default=None, ge=0, le=60000)


class DemoSpeedRequest(BaseModel):
    multiplier: float = Field(default=1.0, gt=0, le=20)


class DemoStateResponse(BaseModel):
    sources: dict[str, str]
    speed: float
    applications: int
    reset_available: bool = True
