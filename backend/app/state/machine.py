from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.models import (
    ActorType,
    Application,
    ApplicationStatus,
    Notification,
    NotificationType,
    StatusHistory,
    User,
)
from app.models.base import utcnow
from app.services import audit

STATUS_LABELS: dict[ApplicationStatus, str] = {
    ApplicationStatus.draft: "Черновик",
    ApplicationStatus.submitted: "Подана",
    ApplicationStatus.processing: "Проверяем данные",
    ApplicationStatus.manual_review: "Ручное рассмотрение",
    ApplicationStatus.client_action: "Ждёт клиента",
    ApplicationStatus.approved: "Одобрено",
    ApplicationStatus.counter_offer: "Встречное предложение",
    ApplicationStatus.rejected: "Отказ",
    ApplicationStatus.signing: "Подписание",
    ApplicationStatus.signed: "Подписано",
    ApplicationStatus.issued: "Выдано",
    ApplicationStatus.client_declined: "Клиент отказался",
    ApplicationStatus.withdrawn: "Отозвана",
}

CLIENT_VISIBLE_STATUSES = set(ApplicationStatus) - {ApplicationStatus.draft}

DECIDED_STATUSES = {
    ApplicationStatus.approved,
    ApplicationStatus.counter_offer,
    ApplicationStatus.rejected,
    ApplicationStatus.client_declined,
}


@dataclass(frozen=True)
class Actor:
    type: ActorType
    id: int | None = None
    name: str = "Система"


SYSTEM_ACTOR = Actor(ActorType.system, None, "Система")


def actor_from_user(user: User) -> Actor:
    return Actor(
        type=ActorType.underwriter if user.role.value == "underwriter" else ActorType.client,
        id=user.id,
        name=user.full_name,
    )


# Разрешённые переходы. Ключ — откуда, значение — куда и кто может.
TRANSITIONS: dict[ApplicationStatus, dict[ApplicationStatus, set[ActorType]]] = {
    ApplicationStatus.draft: {
        ApplicationStatus.submitted: {ActorType.client},
        ApplicationStatus.withdrawn: {ActorType.client},
    },
    ApplicationStatus.submitted: {
        ApplicationStatus.processing: {ActorType.system},
        ApplicationStatus.manual_review: {ActorType.system, ActorType.underwriter},
        ApplicationStatus.withdrawn: {ActorType.client},
    },
    ApplicationStatus.processing: {
        ApplicationStatus.manual_review: {ActorType.system},
        ApplicationStatus.client_action: {ActorType.system},
        ApplicationStatus.approved: {ActorType.system},
        ApplicationStatus.counter_offer: {ActorType.system},
        ApplicationStatus.rejected: {ActorType.system},
        ApplicationStatus.withdrawn: {ActorType.client},
    },
    ApplicationStatus.manual_review: {
        ApplicationStatus.client_action: {ActorType.underwriter},
        ApplicationStatus.approved: {ActorType.underwriter},
        ApplicationStatus.counter_offer: {ActorType.underwriter},
        ApplicationStatus.rejected: {ActorType.underwriter},
        ApplicationStatus.withdrawn: {ActorType.client},
    },
    ApplicationStatus.client_action: {
        ApplicationStatus.processing: {ActorType.system},
        ApplicationStatus.submitted: {ActorType.client},
        ApplicationStatus.withdrawn: {ActorType.client},
    },
    ApplicationStatus.approved: {
        ApplicationStatus.signing: {ActorType.client},
        ApplicationStatus.client_declined: {ActorType.client},
    },
    ApplicationStatus.counter_offer: {
        ApplicationStatus.signing: {ActorType.client},
        ApplicationStatus.client_declined: {ActorType.client},
    },
    ApplicationStatus.signing: {
        ApplicationStatus.signed: {ActorType.client},
    },
    ApplicationStatus.signed: {
        ApplicationStatus.issued: {ActorType.system},
    },
    ApplicationStatus.rejected: {
        ApplicationStatus.submitted: {ActorType.client},
    },
    ApplicationStatus.client_declined: {
        ApplicationStatus.submitted: {ActorType.client},
    },
    ApplicationStatus.withdrawn: {
        ApplicationStatus.submitted: {ActorType.client},
    },
}

TERMINAL_STATUSES = {
    ApplicationStatus.issued,
    ApplicationStatus.rejected,
    ApplicationStatus.client_declined,
    ApplicationStatus.withdrawn,
}


def status_label(status: ApplicationStatus) -> str:
    return STATUS_LABELS[status]


def can_transition(
    from_status: ApplicationStatus, to_status: ApplicationStatus, actor_type: ActorType
) -> bool:
    return actor_type in TRANSITIONS.get(from_status, {}).get(to_status, set())


def transition(
    db: Session,
    application: Application,
    to_status: ApplicationStatus,
    actor: Actor,
    payload: dict[str, Any] | None = None,
) -> StatusHistory:
    """Единственная точка смены статуса заявки.

    Проверяет переход и роль, пишет status_history и audit_log, создаёт уведомление
    клиенту для видимых ему статусов. Недопустимый переход — 409 invalid_transition,
    неверная роль при допустимом переходе — 403 forbidden.
    """
    payload = payload or {}
    db.flush()
    db.execute(
        select(Application.id).where(Application.id == application.id).with_for_update()
    )
    db.refresh(application)
    from_status = application.status
    allowed = TRANSITIONS.get(from_status, {})
    if to_status not in allowed:
        raise ApiError(
            409,
            "invalid_transition",
            f"Переход «{status_label(from_status)}» → «{status_label(to_status)}» недопустим",
        )
    if actor.type not in allowed[to_status]:
        raise ApiError(
            403,
            "forbidden",
            f"Переход «{status_label(from_status)}» → «{status_label(to_status)}» "
            f"недоступен роли {actor.type.value}",
        )

    application.status = to_status
    application.updated_at = utcnow()
    if to_status == ApplicationStatus.submitted:
        application.submitted_at = utcnow()
    if to_status in DECIDED_STATUSES:
        application.decided_at = utcnow()

    labels = payload.get("labels")
    if labels:
        application.labels = sorted(set([*(application.labels or []), *labels]))

    comment = payload.get("comment")
    history = StatusHistory(
        application_id=application.id,
        from_status=from_status,
        to_status=to_status,
        actor_type=actor.type,
        actor_id=actor.id,
        comment=comment,
    )
    db.add(history)
    application.history.append(history)

    audit.record(
        db,
        actor_type=actor.type,
        actor_id=actor.id,
        action="status_changed",
        application_id=application.id,
        before={"status": from_status.value, "status_label": status_label(from_status)},
        after={"status": to_status.value, "status_label": status_label(to_status)},
    )

    if to_status in CLIENT_VISIBLE_STATUSES:
        db.add(
            Notification(
                user_id=application.created_by_id,
                application_id=application.id,
                text=f"Заявка № {application.number}: статус «{status_label(to_status)}»",
                type=NotificationType.status_change,
            )
        )
    db.flush()
    return history
