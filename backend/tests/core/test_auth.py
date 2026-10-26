from __future__ import annotations


def test_all_demo_users_can_login(client):
    expected = {
        "igor.sokolov": ("Игорь Соколов", "client"),
        "anna.belova": ("Анна Белова", "client"),
        "marina.orlova": ("Марина Орлова", "client"),
        "sergey.fomin": ("Сергей Фомин", "client"),
        "olga.kravtsova": ("Ольга Кравцова", "underwriter"),
    }
    for login_name, (full_name, role) in expected.items():
        response = client.post(
            "/auth/login",
            json={"login": login_name, "password": "demo123"},
        )
        assert response.status_code == 200, response.text
        payload = response.json()
        assert payload["user"]["full_name"] == full_name
        assert payload["user"]["role"] == role
        assert payload["token_type"] == "bearer"


def test_wrong_password_returns_401(client):
    response = client.post(
        "/auth/login",
        json={"login": "igor.sokolov", "password": "wrong"},
    )
    assert response.status_code == 401
    assert response.json()["code"] == "invalid_credentials"


def test_me_requires_token_and_returns_company(client, igor):
    unauthorized = client.get("/me")
    assert unauthorized.status_code == 401
    assert unauthorized.json()["code"] == "unauthorized"

    response = client.get("/me", headers=igor)
    assert response.status_code == 200
    assert response.json()["login"] == "igor.sokolov"
    assert response.json()["company"]["name"] == "ООО «Дом и уют»"


def test_client_cannot_open_bank_console(client, igor):
    response = client.get("/bank/applications", headers=igor)
    assert response.status_code == 403
    assert response.json()["code"] == "forbidden"


def test_client_cannot_call_client_only_endpoint_as_underwriter(client, olga):
    response = client.get("/me/cashflow", headers=olga)
    assert response.status_code == 403
