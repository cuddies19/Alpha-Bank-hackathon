from __future__ import annotations

from app.services.audit import mask_personal_data


def test_mask_passport_and_phone():
    assert mask_personal_data("4512345612") == "45 •• ••••12"
    masked = mask_personal_data({"phone": "+7 916 123-45-12", "passport": "4512 345612"})
    assert "916" not in str(masked)
    assert "345612" not in str(masked)
    assert "••" in str(masked)


def test_mask_nested_payload_and_long_digits():
    payload = {
        "client": {
            "phone_number": "8 916 123-45-12",
            "comment": "перезвонить на 89161234512 или +7 916 123-45-12 после 12:00",
        },
        "application_number": "2026-10-0142",
    }
    masked = mask_personal_data(payload)
    assert "89161234512" not in str(masked)
    assert "123-45-12" not in masked["client"]["comment"]
    assert "••" in masked["client"]["comment"]
    assert masked["application_number"] == "2026-10-0142"
