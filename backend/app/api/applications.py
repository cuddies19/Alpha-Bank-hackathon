from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_client
from app.models import ApplicationStatus, User
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationDetail,
    ApplicationList,
    ApplicationUpdate,
    DeclineRequest,
    DocumentOut,
    SignRequest,
    WithdrawRequest,
)
from app.services import applications as service
from app.services import documents as document_service
from app.services.presenters import application_detail, application_list_item, document_out

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=ApplicationList)
def list_applications(
    status: ApplicationStatus | None = None,
    product_id: int | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationList:
    rows, total = service.list_applications(
        db,
        user,
        status=status,
        product_id=product_id,
        limit=limit,
        offset=offset,
    )
    return ApplicationList(items=[application_list_item(row) for row in rows], total=total)


@router.post("", response_model=ApplicationDetail, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.create_application(db, user, payload)
    return application_detail(application)


@router.get("/{application_id}", response_model=ApplicationDetail)
def get_application(
    application_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    return application_detail(application)


@router.patch("/{application_id}", response_model=ApplicationDetail)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.update_application(db, application, payload, user)
    return application_detail(application)


@router.post(
    "/{application_id}/documents",
    response_model=DocumentOut,
    status_code=status.HTTP_201_CREATED,
)
def upload_document(
    application_id: int,
    file: UploadFile = File(...),
    doc_type: str = Form(default="other"),
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> DocumentOut:
    application = service.get_application_for_user(db, application_id, user)
    document = document_service.save_document(db, application, user, file, doc_type)
    return document_out(document)


@router.post("/{application_id}/submit", response_model=ApplicationDetail)
def submit_application(
    application_id: int,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.submit_application(db, application, user)
    return application_detail(application)


@router.post("/{application_id}/withdraw", response_model=ApplicationDetail)
def withdraw_application(
    application_id: int,
    payload: WithdrawRequest | None = None,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.withdraw_application(
        db, application, user, payload.reason if payload else None
    )
    return application_detail(application)


@router.post("/{application_id}/accept", response_model=ApplicationDetail)
def accept_application(
    application_id: int,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.accept_offer(db, application, user)
    return application_detail(application)


@router.post("/{application_id}/decline", response_model=ApplicationDetail)
def decline_application(
    application_id: int,
    payload: DeclineRequest | None = None,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.decline_offer(db, application, user, payload.reason if payload else None)
    return application_detail(application)


@router.post("/{application_id}/sign", response_model=ApplicationDetail)
def sign_application(
    application_id: int,
    payload: SignRequest | None = None,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.sign_application(db, application, user)
    return application_detail(application)


@router.post("/{application_id}/resubmit", response_model=ApplicationDetail)
def resubmit_application(
    application_id: int,
    user: User = Depends(require_client),
    db: Session = Depends(get_db),
) -> ApplicationDetail:
    application = service.get_application_for_user(db, application_id, user)
    application = service.resubmit_application(db, application, user)
    return application_detail(application)
