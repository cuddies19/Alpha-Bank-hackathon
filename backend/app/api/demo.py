from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.errors import ApiError
from app.models import Application, SourceStatus
from app.schemas.assistant import DemoSourceRequest, DemoSpeedRequest, DemoStateResponse
from app.services.presenters import SOURCE_LABELS

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_STATE: dict[str, object] = {
    "sources": {code: SourceStatus.ok.value for code in SOURCE_LABELS},
    "speed": 1.0,
}


def _state(db: Session) -> DemoStateResponse:
    count = db.scalar(select(func.count(Application.id))) or 0
    return DemoStateResponse(
        sources=dict(DEMO_STATE["sources"]),  # type: ignore[arg-type]
        speed=float(DEMO_STATE["speed"]),  # type: ignore[arg-type]
        applications=int(count),
    )


@router.get("/state", response_model=DemoStateResponse)
def state(db: Session = Depends(get_db)) -> DemoStateResponse:
    return _state(db)


@router.post("/sources/{source}", response_model=DemoStateResponse)
def set_source(
    source: str,
    payload: DemoSourceRequest,
    db: Session = Depends(get_db),
) -> DemoStateResponse:
    if source not in SOURCE_LABELS:
        raise ApiError(404, "source_not_found", "Неизвестный источник")
    if payload.status is not None:
        try:
            status = SourceStatus(payload.status)
        except ValueError as exc:
            raise ApiError(422, "invalid_source_status", "Недопустимый статус источника") from exc
        sources = dict(DEMO_STATE["sources"])  # type: ignore[arg-type]
        sources[source] = status.value
        DEMO_STATE["sources"] = sources
    return _state(db)


@router.post("/speed", response_model=DemoStateResponse)
def set_speed(payload: DemoSpeedRequest, db: Session = Depends(get_db)) -> DemoStateResponse:
    DEMO_STATE["speed"] = payload.multiplier
    return _state(db)


@router.post("/reset", response_model=DemoStateResponse)
def reset(db: Session = Depends(get_db)) -> DemoStateResponse:
    DEMO_STATE["sources"] = {code: SourceStatus.ok.value for code in SOURCE_LABELS}
    DEMO_STATE["speed"] = 1.0
    return _state(db)
