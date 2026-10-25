from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_underwriter
from app.models import ActorType, ApplicationStatus, User
from app.schemas.bank import (
    AuditList,
    BankApplicationDetail,
    BankQueueResponse,
    DecisionRequest,
    SourceHealthList,
)
from app.services import bank as service

router = APIRouter(prefix="/bank", tags=["bank"])


@router.get("/applications", response_model=BankQueueResponse)
def queue(
    status_filter: ApplicationStatus | None = Query(default=None, alias="status"),
    product_id: int | None = None,
    risk_class: str | None = Query(default=None, max_length=1),
    amount_min: int | None = Query(default=None, ge=0),
    amount_max: int | None = Query(default=None, ge=0),
    query: str | None = Query(default=None, max_length=255),
    mine: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> BankQueueResponse:
    return service.queue(
        db,
        user,
        status=status_filter,
        product_id=product_id,
        risk_class=risk_class,
        amount_min=amount_min,
        amount_max=amount_max,
        query=query,
        mine=mine,
        limit=limit,
        offset=offset,
    )


@router.get("/applications/{application_id}", response_model=BankApplicationDetail)
def card(
    application_id: int,
    _: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> BankApplicationDetail:
    return service.card(db, application_id)


@router.post("/applications/{application_id}/take", response_model=BankApplicationDetail)
def take(
    application_id: int,
    user: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> BankApplicationDetail:
    return service.take(db, application_id, user)


@router.post("/applications/{application_id}/decision", response_model=BankApplicationDetail)
def decide(
    application_id: int,
    payload: DecisionRequest,
    user: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> BankApplicationDetail:
    return service.decide(db, application_id, user, payload)


@router.get("/audit", response_model=AuditList)
def audit(
    actor_type: ActorType | None = None,
    application_id: int | None = None,
    action: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> AuditList:
    return service.audit_log(
        db,
        actor_type=actor_type,
        application_id=application_id,
        action=action,
        limit=limit,
        offset=offset,
    )


@router.get("/sources", response_model=SourceHealthList)
def sources(
    _: User = Depends(require_underwriter),
    db: Session = Depends(get_db),
) -> SourceHealthList:
    return service.sources(db)
