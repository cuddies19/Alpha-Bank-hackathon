from __future__ import annotations

import pytest
from sqlalchemy import func, select, update

from app.errors import ApiError
from app.models import ActorType, Application, ApplicationStatus, AuditLog, User
from app.state.machine import Actor, actor_from_user, transition


def _user(db, login_name: str) -> User:
    return db.scalar(select(User).where(User.login == login_name))


def test_submit_writes_history_audit_and_notification(client, igor, create_application, db):
    application = create_application()
    response = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "submitted"
    assert payload["history"][-1]["from_status"] == "draft"
    assert payload["history"][-1]["to_status"] == "submitted"
    assert payload["history"][-1]["actor_type"] == "client"

    audit_rows = db.scalar(
        select(func.count(AuditLog.id)).where(
            AuditLog.application_id == application["id"],
            AuditLog.action == "status_changed",
        )
    )
    assert audit_rows == 1

    notifications = client.get("/notifications", headers=igor).json()
    assert notifications["unread"] >= 1
    assert any(application["number"] in item["text"] for item in notifications["items"])


def test_draft_to_approved_is_rejected_with_409(client, igor, create_application, db):
    created = create_application()
    application = db.get(Application, created["id"])
    client_user = _user(db, "igor.sokolov")

    with pytest.raises(ApiError) as error:
        transition(
            db,
            application,
            ApplicationStatus.approved,
            actor_from_user(client_user),
        )
    assert error.value.status_code == 409
    assert error.value.code == "invalid_transition"
    assert db.get(Application, application.id).status == ApplicationStatus.draft


def test_transition_reloads_status_before_check(create_application, db):
    created = create_application()
    application = db.get(Application, created["id"])
    client_user = _user(db, "igor.sokolov")
    db.execute(
        update(Application)
        .where(Application.id == application.id)
        .values(status=ApplicationStatus.submitted)
        .execution_options(synchronize_session=False)
    )

    with pytest.raises(ApiError) as error:
        transition(
            db,
            application,
            ApplicationStatus.submitted,
            actor_from_user(client_user),
        )
    assert error.value.status_code == 409
    assert error.value.code == "invalid_transition"


def test_rejected_to_signed_is_rejected_with_409(create_application, db):
    created = create_application()
    application = db.get(Application, created["id"])
    client_user = _user(db, "igor.sokolov")
    application.status = ApplicationStatus.rejected
    db.commit()

    with pytest.raises(ApiError) as error:
        transition(db, application, ApplicationStatus.signed, actor_from_user(client_user))
    assert error.value.status_code == 409
    assert error.value.code == "invalid_transition"


def test_wrong_role_gets_403(create_application, db):
    created = create_application()
    application = db.get(Application, created["id"])
    underwriter = _user(db, "olga.kravtsova")
    actor = Actor(ActorType.underwriter, underwriter.id, underwriter.full_name)

    with pytest.raises(ApiError) as error:
        transition(db, application, ApplicationStatus.submitted, actor)
    assert error.value.status_code == 403
    assert error.value.code == "forbidden"


def test_withdraw_twice_returns_409(client, igor, create_application):
    application = create_application()
    client.post(f"/applications/{application['id']}/submit", headers=igor)
    first = client.post(f"/applications/{application['id']}/withdraw", headers=igor)
    assert first.status_code == 200
    assert first.json()["status"] == "withdrawn"

    second = client.post(f"/applications/{application['id']}/withdraw", headers=igor)
    assert second.status_code == 409
    assert second.json()["code"] == "invalid_transition"


def test_resubmit_after_withdraw(client, igor, create_application):
    application = create_application()
    client.post(f"/applications/{application['id']}/submit", headers=igor)
    client.post(f"/applications/{application['id']}/withdraw", headers=igor)

    response = client.post(f"/applications/{application['id']}/resubmit", headers=igor)
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "submitted"
    assert "Повторная подача" in payload["labels"]
    assert payload["history"][-1]["from_status"] == "withdrawn"
