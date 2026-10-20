import pytest

from app.db import session
from app.settings import Settings


@pytest.mark.positive
def test_sa_url_selects_psycopg_driver_only_for_plain_postgresql(unit) -> None:
    for case in unit["sa_urls"]:
        assert session.sa_url(case["url"]) == case["expected"]


@pytest.mark.positive
def test_session_factory_keeps_objects_usable_after_commit() -> None:
    assert session.SessionLocal.kw["expire_on_commit"] is False
    assert session.engine.url.drivername == "postgresql+psycopg"


@pytest.mark.positive
def test_settings_defaults(monkeypatch, unit) -> None:
    for name in unit["settings_env"]:
        monkeypatch.delenv(name, raising=False)
    s = Settings()
    assert s.model_dump() == unit["settings_defaults"]


@pytest.mark.positive
def test_settings_from_environment(monkeypatch, unit) -> None:
    for name, value in unit["settings_env"].items():
        monkeypatch.setenv(name, value)
    s = Settings()
    assert (s.database_url, s.mocks_url) == (
        unit["settings_env"]["DATABASE_URL"],
        unit["settings_env"]["MOCKS_URL"],
    )
