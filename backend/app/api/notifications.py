from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.errors import ApiError
from app.models import Notification, User
from app.schemas.applications import NotificationList, NotificationOut
from app.services.presenters import notification_out

router = APIRouter(tags=["client"])


@router.get("/notifications", response_model=NotificationList)
def list_notifications(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> NotificationList:
    rows = list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
        )
    )
    unread = (
        db.scalar(
            select(func.count(Notification.id)).where(
                Notification.user_id == user.id, Notification.read.is_(False)
            )
        )
        or 0
    )
    return NotificationList(
        items=[notification_out(notification) for notification in rows],
        unread=int(unread),
    )


@router.post("/notifications/{notification_id}/read", response_model=NotificationOut)
def read_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NotificationOut:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise ApiError(404, "notification_not_found", "Уведомление не найдено")
    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification_out(notification)
