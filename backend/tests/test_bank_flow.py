from __future__ import annotations

from app.models import Application


def _submitted_application(client, igor, create_application):
    application = create_application()
    response = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert response.status_code == 200, response.text
    return response.json()


def test_bank_queue_take_decision_accept_sign_and_loan(client, igor, olga, create_application):
    application = _submitted_application(client, igor, create_application)

    queue = client.get("/bank/applications", headers=olga)
    assert queue.status_code == 200
    payload = queue.json()
    assert payload["total"] == 1
    assert payload["counters"]["new"] == 1
    assert payload["items"][0]["number"] == application["number"]

    card = client.get(f"/bank/applications/{application['id']}", headers=olga)
    assert card.status_code == 200
    assert card.json()["status"] == "submitted"

    taken = client.post(f"/bank/applications/{application['id']}/take", headers=olga)
    assert taken.status_code == 200
    assert taken.json()["status"] == "manual_review"
    assert taken.json()["taken_by_name"] == "Ольга Кравцова"

    decided = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={
            "outcome": "counter",
            "amount": 2_400_000,
            "term_months": 18,
            "rate": 21.5,
            "client_message": "Платёж 32% потока — уменьшаем сумму.",
            "internal_comment": "Сезонность учтена.",
        },
    )
    assert decided.status_code == 200, decided.text
    decided_payload = decided.json()
    assert decided_payload["status"] == "counter_offer"
    assert decided_payload["decision"]["outcome"] == "counter"
    assert decided_payload["decision"]["amount"] == 2_400_000
    assert decided_payload["decision"]["internal_comment"] == "Сезонность учтена."

    accepted = client.post(f"/applications/{application['id']}/accept", headers=igor)
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "signing"

    signed = client.post(f"/applications/{application['id']}/sign", headers=igor)
    assert signed.status_code == 200
    assert signed.json()["status"] == "issued"

    loans = client.get("/loans", headers=igor).json()
    assert len(loans) == 1
    assert loans[0]["amount"] == 2_400_000
    assert len(loans[0]["schedule"]) == 18
    assert loans[0]["schedule"][-1]["remaining"] == 0


def test_resubmit_clears_previous_decision_and_assignee(client, igor, olga, create_application):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)
    client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={"outcome": "decline", "decline_reason": "Стоп-фактор"},
    )

    resubmitted = client.post(f"/applications/{application['id']}/resubmit", headers=igor)
    assert resubmitted.status_code == 200, resubmitted.text
    payload = resubmitted.json()
    assert payload["status"] == "submitted"
    assert payload["decision"] is None
    assert payload["taken_by_name"] is None
    assert "Повторная подача" in payload["labels"]

    queue = client.get("/bank/applications?status=submitted", headers=olga).json()
    item = next(row for row in queue["items"] if row["id"] == application["id"])
    assert item["taken_by_name"] is None


def test_current_decision_ignores_previous_cycle(client, igor, olga, create_application, db):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)
    client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={"outcome": "decline", "decline_reason": "Стоп-фактор"},
    )
    client.post(f"/applications/{application['id']}/resubmit", headers=igor)

    row = db.get(Application, application["id"])
    assert row.latest_decision is not None
    assert row.current_decision is None


def test_client_cannot_take_or_decide(client, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    response = client.post(f"/bank/applications/{application['id']}/take", headers=igor)
    assert response.status_code == 403


def test_decision_requires_manual_review(client, olga, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    response = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={"outcome": "approve"},
    )
    assert response.status_code == 409
    assert response.json()["code"] == "invalid_transition"


def test_decline_requires_reason_and_writes_decision(client, olga, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)

    missing = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={"outcome": "decline"},
    )
    assert missing.status_code == 422
    assert missing.json()["code"] == "decline_reason_required"

    declined = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={
            "outcome": "decline",
            "decline_reason": "Просрочка больше 60 дней",
            "client_message": "Сейчас банк не может выдать кредит.",
        },
    )
    assert declined.status_code == 200
    assert declined.json()["status"] == "rejected"

    detail = client.get(f"/applications/{application['id']}", headers=igor).json()
    assert detail["decision"]["outcome"] == "decline"
    assert detail["decision"]["decline_reason"] == "Просрочка больше 60 дней"
    assert "internal_comment" not in detail["decision"]


def test_request_documents_moves_to_client_action(client, olga, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)

    response = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={
            "outcome": "request",
            "requested_documents": ["Бухгалтерская отчётность за 2025 год"],
            "client_message": "Пришлите отчётность.",
        },
    )
    assert response.status_code == 200
    assert response.json()["status"] == "client_action"
    assert response.json()["stages"][2]["description"].startswith("Банк запросил документы")


def test_internal_comment_not_visible_to_client(client, olga, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)

    decision = client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={
            "outcome": "request",
            "requested_documents": ["Бухгалтерская отчётность за 2025 год"],
            "internal_comment": "Клиент выглядит рискованно",
        },
    )
    assert decision.status_code == 200, decision.text

    detail = client.get(f"/applications/{application['id']}", headers=igor).json()
    comments = [item["comment"] for item in detail["history"] if item["comment"]]
    assert all("рискованно" not in comment for comment in comments)

    card = client.get(f"/bank/applications/{application['id']}", headers=olga).json()
    assert card["decision"]["internal_comment"] == "Клиент выглядит рискованно"


def test_bank_audit_and_sources(client, olga, igor, create_application):
    application = _submitted_application(client, igor, create_application)
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)

    audit = client.get("/bank/audit", headers=olga).json()
    assert audit["total"] >= 3
    actions = [item["action"] for item in audit["items"]]
    assert "application_created" in actions
    assert "status_changed" in actions
    assert "application_taken" in actions

    sources = client.get("/bank/sources", headers=olga)
    assert sources.status_code == 200
    assert {item["code"] for item in sources.json()["items"]} == {
        "egrul",
        "fns",
        "bki",
        "statement",
    }
