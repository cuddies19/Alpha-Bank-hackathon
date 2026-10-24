from __future__ import annotations

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db
from app.errors import ApiError
from app.models import User, UserRole
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise ApiError(401, "unauthorized", "Нужен заголовок Authorization: Bearer <token>")
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError as exc:
        raise ApiError(401, "token_expired", "Срок действия токена истёк") from exc
    except jwt.PyJWTError as exc:
        raise ApiError(401, "invalid_token", "Некорректный токен") from exc

    user_id = payload.get("sub")
    if user_id is None:
        raise ApiError(401, "invalid_token", "В токене нет пользователя")
    try:
        user_id_int = int(str(user_id))
    except (TypeError, ValueError) as exc:
        raise ApiError(401, "invalid_token", "Некорректный идентификатор пользователя") from exc
    user = db.get(User, user_id_int)
    if user is None:
        raise ApiError(401, "invalid_token", "Пользователь не найден")
    return user


def require_client(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.client:
        raise ApiError(403, "forbidden", "Действие доступно только клиенту")
    return user


def require_underwriter(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.underwriter:
        raise ApiError(403, "forbidden", "Действие доступно только андеррайтеру")
    return user
