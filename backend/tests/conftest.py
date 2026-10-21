from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SEED_ON_STARTUP"] = "false"
os.environ["JWT_SECRET"] = "test-secret-that-is-definitely-long-enough-123456"
os.environ["DEMO_PASSWORD"] = "demo123"
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp(prefix="alpha-tests-uploads-")
os.environ["MAX_UPLOAD_SIZE"] = str(10 * 1024 * 1024)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models import Base
from app.services.seed import seed_demo_data

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as db:
        seed_demo_data(db)
    upload_dir = Path(os.environ["UPLOAD_DIR"])
    if upload_dir.exists():
        shutil.rmtree(upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def login(client):
    def _login(login_name: str = "igor.sokolov") -> dict[str, str]:
        response = client.post(
            "/auth/login",
            json={"login": login_name, "password": "demo123"},
        )
        assert response.status_code == 200, response.text
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _login


@pytest.fixture
def igor(login):
    return login("igor.sokolov")


@pytest.fixture
def olga(login):
    return login("olga.kravtsova")


@pytest.fixture
def create_application(client, igor):
    def _create(
        *,
        product_code: str = "credit_line",
        amount: int = 3_000_000,
        term_months: int = 18,
        purpose: str = "Закупка партии к распродаже",
        consents: dict[str, bool] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict:
        products = client.get("/products").json()
        product = next(item for item in products if item["code"] == product_code)
        response = client.post(
            "/applications",
            headers=headers or igor,
            json={
                "product_id": product["id"],
                "amount": amount,
                "term_months": term_months,
                "purpose": purpose,
                "consents": consents or {"personal_data": True, "bki_request": True, "terms": True},
            },
        )
        assert response.status_code == 201, response.text
        return response.json()

    return _create


@pytest.fixture(scope="session", autouse=True)
def cleanup_uploads():
    yield
    shutil.rmtree(os.environ["UPLOAD_DIR"], ignore_errors=True)
