from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app import modes

router = APIRouter(prefix="/_admin/sources")


class ModeBody(BaseModel):
    mode: Literal["ok", "slow", "down", "error"] = "ok"
    delay_ms: int | None = Field(default=None, ge=0)


@router.get("")
def get_sources() -> dict:
    return modes.state


@router.post("/_reset")
def reset_sources() -> dict:
    modes.reset()
    return modes.state


@router.post("/{source}")
def set_source(source: str, body: ModeBody) -> dict:
    if source not in modes.SOURCES:
        raise HTTPException(status_code=404, detail="unknown source")
    modes.set_mode(source, body.mode, body.delay_ms)
    return modes.state[source]
