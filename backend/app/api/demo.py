from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.errors import ApiError
from app.models import Application, SourceStatus
from app.pipeline import demo
from app.pipeline.settings import pipeline_settings
from app.schemas.assistant import DemoSourceRequest, DemoSpeedRequest, DemoStateResponse
from app.services.presenters import SOURCE_LABELS


def only_in_dev(settings: Settings = Depends(get_settings)) -> None:
    # Demo controls switch sources and reset data, so they exist only with APP_ENV=dev.
    if settings.app_env != "dev":
        raise ApiError(404, "not_found", "Не найдено")


router = APIRouter(prefix="/demo", tags=["demo"], dependencies=[Depends(only_in_dev)])


def get_mocks() -> demo.MocksAdmin:
    return demo.MocksAdmin(pipeline_settings.mocks_url)


def _state(db: Session, mocks: demo.MocksAdmin) -> DemoStateResponse:
    count = db.scalar(select(func.count(Application.id))) or 0
    return DemoStateResponse(
        sources=mocks.statuses(),
        speed=demo.get_speed(db),
        applications=int(count),
    )


def _mocks_down() -> ApiError:
    return ApiError(503, "mocks_unavailable", "Сервис моков недоступен")


@router.get("/state", response_model=DemoStateResponse)
def state(
    db: Session = Depends(get_db), mocks: demo.MocksAdmin = Depends(get_mocks)
) -> DemoStateResponse:
    return _state(db, mocks)


@router.post("/sources/{source}", response_model=DemoStateResponse)
def set_source(
    source: str,
    payload: DemoSourceRequest,
    db: Session = Depends(get_db),
    mocks: demo.MocksAdmin = Depends(get_mocks),
) -> DemoStateResponse:
    if source not in SOURCE_LABELS:
        raise ApiError(404, "source_not_found", "Неизвестный источник")
    if payload.status is not None:
        try:
            status = SourceStatus(payload.status)
        except ValueError as exc:
            raise ApiError(422, "invalid_source_status", "Недопустимый статус источника") from exc
        try:
            mocks.set_status(source, status.value, payload.latency_ms)
        except demo.MocksUnavailable as exc:
            raise _mocks_down() from exc
    return _state(db, mocks)


@router.post("/speed", response_model=DemoStateResponse)
def set_speed(
    payload: DemoSpeedRequest,
    db: Session = Depends(get_db),
    mocks: demo.MocksAdmin = Depends(get_mocks),
) -> DemoStateResponse:
    demo.set_speed(db, payload.multiplier)
    db.commit()
    return _state(db, mocks)


@router.post("/reset", response_model=DemoStateResponse)
def reset(
    db: Session = Depends(get_db), mocks: demo.MocksAdmin = Depends(get_mocks)
) -> DemoStateResponse:
    try:
        mocks.reset()
    except demo.MocksUnavailable as exc:
        raise _mocks_down() from exc
    demo.set_speed(db, 1.0)
    db.commit()
    return _state(db, mocks)
