from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.errors import ApiError
from app.models import ActorType, Application, ApplicationStatus, Document, DocumentStatus, User
from app.services import audit
from app.state.machine import actor_from_user, transition

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}
CHUNK_SIZE = 1024 * 1024


def save_document(
    db: Session,
    application: Application,
    user: User,
    upload: UploadFile,
    doc_type: str,
) -> Document:
    settings = get_settings()
    original_name = Path(upload.filename or "document").name
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ApiError(422, "invalid_file_type", "Разрешены только PDF, JPG и PNG")
    content_type = (upload.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise ApiError(422, "invalid_file_type", "Некорректный MIME-тип файла")

    directory = settings.upload_dir / str(application.id)
    directory.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{extension}"
    target = directory / stored_name

    size = 0
    try:
        with target.open("wb") as handle:
            while chunk := upload.file.read(CHUNK_SIZE):
                size += len(chunk)
                if size > settings.max_upload_size:
                    raise ApiError(
                        422,
                        "file_too_large",
                        f"Файл больше {settings.max_upload_size // (1024 * 1024)} МБ",
                    )
                handle.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise

    document = Document(
        application_id=application.id,
        doc_type=doc_type.strip() or "other",
        filename=original_name,
        path=f"{application.id}/{stored_name}",
        mime_type=content_type,
        size_bytes=size,
        status=DocumentStatus.uploaded,
        uploaded_by_id=user.id,
    )
    db.add(document)
    audit.record(
        db,
        actor_type=ActorType.client if user.role.value == "client" else ActorType.underwriter,
        actor_id=user.id,
        action="document_uploaded",
        application_id=application.id,
        after={
            "doc_type": document.doc_type,
            "filename": document.filename,
            "size_bytes": document.size_bytes,
            "mime_type": document.mime_type,
        },
    )
    if application.status == ApplicationStatus.client_action:
        transition(
            db,
            application,
            ApplicationStatus.submitted,
            actor_from_user(user),
            {"comment": "Клиент загрузил документы"},
        )
    db.commit()
    db.refresh(document)
    return document
