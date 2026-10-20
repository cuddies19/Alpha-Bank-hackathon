import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError

from app.db.session import sa_url
from app.main import app
from app.settings import settings


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


_unreachable: list[str] = []


def _unavailable(reason: str) -> None:
    # In CI a missing database is a failure, not a skip.
    if os.environ.get("CI"):
        pytest.fail(reason)
    pytest.skip(reason)


@pytest.fixture
def pg_url() -> URL:
    """URL of an empty schema in Postgres; the schema is removed after the test."""
    if _unreachable:
        _unavailable(_unreachable[0])
    base = make_url(sa_url(os.environ.get("DATABASE_URL") or settings.database_url))
    admin = create_engine(base, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 1})
    schema = "t_" + uuid.uuid4().hex[:12]
    try:
        with admin.connect() as conn:
            conn.execute(text(f"create schema {schema}"))
    except OperationalError:
        _unreachable.append("Postgres is not reachable at DATABASE_URL")
        admin.dispose()
        _unavailable(_unreachable[0])
    try:
        yield base.update_query_dict({"options": f"-csearch_path={schema}"})
    finally:
        with admin.connect() as conn:
            conn.execute(text(f"drop schema {schema} cascade"))
        admin.dispose()
