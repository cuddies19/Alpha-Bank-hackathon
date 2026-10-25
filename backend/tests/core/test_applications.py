from __future__ import annotations

from sqlalchemy import func, select

from app.models import AuditLog


def test_application_lifecycle(client, igor, create_application):
    application = create_application()
    assert application["status"] == "draft"
    assert application["number"].startswith("2026-10-")

    patched = client.patch(
        f"/applications/{application['id']}",
        headers=igor,
        json={"amount": 2_500_000, "purpose": "Закупка к распродаже 11.11"},
    )
    assert patched.status_code == 200
    assert patched.json()["amount"] == 2_500_000

    submitted = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert submitted.status_code == 200
    body = submitted.json()
    assert body["status"] == "submitted"
    assert body["submitted_at"] is not None
    assert [stage["status"] for stage in body["stages"]][:2] == ["done", "current"]

    listed = client.get("/applications", headers=igor).json()
    assert listed["total"] == 1
    assert listed["items"][0]["number"] == application["number"]

    detail = client.get(f"/applications/{application['id']}", headers=igor)
    assert detail.status_code == 200
    assert detail.json()["company"]["name"] == "ООО «Дом и уют»"
    assert len(detail.json()["history"]) == 1


def test_submit_requires_consents(client, igor, create_application):
    application = create_application(
        consents={"personal_data": True, "bki_request": False, "terms": True}
    )
    response = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert response.status_code == 422
    assert response.json()["code"] == "consents_required"
    assert "bki_request" in response.json()["message"]


def test_draft_cannot_be_submitted_twice(client, igor, create_application):
    application = create_application()
    client.post(f"/applications/{application['id']}/submit", headers=igor)
    response = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert response.status_code == 409
    assert response.json()["code"] == "invalid_transition"


def test_offer_actions_on_draft_return_invalid_transition(client, igor, create_application):
    application = create_application()
    for action in ("accept", "decline", "sign"):
        response = client.post(f"/applications/{application['id']}/{action}", headers=igor)
        assert response.status_code == 409, action
        assert response.json()["code"] == "invalid_transition", action


def test_resubmit_draft_returns_invalid_transition(client, igor, create_application):
    application = create_application()
    response = client.post(f"/applications/{application['id']}/resubmit", headers=igor)
    assert response.status_code == 409
    assert response.json()["code"] == "invalid_transition"


def test_client_cannot_read_foreign_application(client, login, create_application):
    application = create_application()
    anna = login("anna.belova")

    response = client.get(f"/applications/{application['id']}", headers=anna)
    assert response.status_code == 404
    assert response.json()["code"] == "application_not_found"


def test_client_cannot_patch_foreign_application(client, login, create_application):
    application = create_application()
    anna = login("anna.belova")

    response = client.patch(
        f"/applications/{application['id']}",
        headers=anna,
        json={"amount": 1_000_000},
    )
    assert response.status_code == 404


def test_underwriter_sees_all_applications(client, login, create_application):
    create_application()
    anna = login("anna.belova")
    products = client.get("/products").json()
    product_id = products[0]["id"]
    response = client.post(
        "/applications",
        headers=anna,
        json={
            "product_id": product_id,
            "amount": 500_000,
            "term_months": 12,
            "purpose": "Оборудование",
            "consents": {"personal_data": True, "bki_request": True, "terms": True},
        },
    )
    assert response.status_code == 201, response.text

    olga = login("olga.kravtsova")
    listed = client.get("/applications", headers=olga).json()
    assert listed["total"] == 2


def test_patch_needed_by_writes_json_safe_audit(client, igor, create_application, db):
    application = create_application()
    response = client.patch(
        f"/applications/{application['id']}",
        headers=igor,
        json={"needed_by": "2026-12-01"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["needed_by"] == "2026-12-01"

    entry = db.scalar(
        select(AuditLog)
        .where(
            AuditLog.application_id == application["id"],
            AuditLog.action == "application_updated",
        )
        .order_by(AuditLog.id.desc())
    )
    assert entry is not None
    assert entry.after is not None
    assert entry.after["needed_by"] == "2026-12-01"


def test_amount_outside_product_limits_returns_422(client, igor):
    product = next(item for item in client.get("/products").json() if item["code"] == "overdraft")
    response = client.post(
        "/applications",
        headers=igor,
        json={
            "product_id": product["id"],
            "amount": 100,
            "term_months": 6,
            "purpose": "Кассовый разрыв",
            "consents": {},
        },
    )
    assert response.status_code == 422
    assert response.json()["code"] == "amount_out_of_range"


def test_update_logs_masked_audit(client, igor, olga, create_application, db):
    application = create_application()
    response = client.patch(
        f"/applications/{application['id']}",
        headers=igor,
        json={"purpose": "Позвонить 89161234512 и уточнить закупку"},
    )
    assert response.status_code == 200

    entries = list(
        db.scalars(
            select(AuditLog).where(
                AuditLog.application_id == application["id"],
                AuditLog.action == "application_updated",
            )
        )
    )
    assert entries
    after = entries[-1].after
    assert after is not None
    assert "89161234512" not in str(after)
    assert "••" in str(after)

    audit = client.get("/bank/audit", headers=olga).json()
    assert audit["total"] >= 1
    assert all("89161234512" not in str(item) for item in audit["items"])

    count = db.scalar(
        select(func.count(AuditLog.id)).where(AuditLog.application_id == application["id"])
    )
    assert count >= 2
