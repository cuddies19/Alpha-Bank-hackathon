from __future__ import annotations

import os
from pathlib import Path


def test_upload_pdf_document(client, igor, create_application):
    application = create_application()
    response = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "financial_statement"},
        files={"file": ("report.pdf", b"%PDF-1.7 fake", "application/pdf")},
    )
    assert response.status_code == 201, response.text
    document = response.json()
    assert document["doc_type"] == "financial_statement"
    assert document["size_bytes"] == len(b"%PDF-1.7 fake")

    stored = Path(os.environ["UPLOAD_DIR"]) / str(application["id"])
    assert any(stored.iterdir())

    detail = client.get(f"/applications/{application['id']}", headers=igor).json()
    assert len(detail["documents"]) == 1


def test_invalid_extension_is_rejected(client, igor, create_application):
    application = create_application()
    response = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "other"},
        files={"file": ("virus.exe", b"binary", "application/pdf")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "invalid_file_type"


def test_invalid_mime_is_rejected(client, igor, create_application):
    application = create_application()
    response = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "other"},
        files={"file": ("report.pdf", b"fake", "text/plain")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "invalid_file_type"


def test_file_over_10_mb_is_rejected(client, igor, create_application):
    application = create_application()
    payload = b"0" * (10 * 1024 * 1024 + 1)
    response = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "other"},
        files={"file": ("big.pdf", payload, "application/pdf")},
    )
    assert response.status_code == 422
    assert response.json()["code"] == "file_too_large"


def test_foreign_application_document_upload_returns_404(client, login, create_application):
    application = create_application()
    anna = login("anna.belova")
    response = client.post(
        f"/applications/{application['id']}/documents",
        headers=anna,
        data={"doc_type": "other"},
        files={"file": ("report.pdf", b"fake", "application/pdf")},
    )
    assert response.status_code == 404


def test_upload_returns_application_from_client_action(client, igor, olga, create_application):
    application = create_application()
    submitted = client.post(f"/applications/{application['id']}/submit", headers=igor)
    assert submitted.status_code == 200, submitted.text
    client.post(f"/bank/applications/{application['id']}/take", headers=olga)
    client.post(
        f"/bank/applications/{application['id']}/decision",
        headers=olga,
        json={
            "outcome": "request",
            "requested_documents": ["Бухгалтерская отчётность за 2025 год"],
            "client_message": "Пришлите отчётность.",
        },
    )

    uploaded = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "financial_statement"},
        files={"file": ("report.pdf", b"%PDF-1.7 fake", "application/pdf")},
    )
    assert uploaded.status_code == 201, uploaded.text

    detail = client.get(f"/applications/{application['id']}", headers=igor).json()
    assert detail["status"] == "submitted"
    assert detail["history"][-1]["from_status"] == "client_action"
    assert detail["history"][-1]["to_status"] == "submitted"

    queue = client.get("/bank/applications", headers=olga).json()
    assert queue["counters"]["new"] == 1

    again = client.post(
        f"/applications/{application['id']}/documents",
        headers=igor,
        data={"doc_type": "other"},
        files={"file": ("extra.pdf", b"%PDF-1.7 fake", "application/pdf")},
    )
    assert again.status_code == 201

    detail = client.get(f"/applications/{application['id']}", headers=igor).json()
    assert detail["status"] == "submitted"
    assert sum(item["to_status"] == "submitted" for item in detail["history"]) == 2
