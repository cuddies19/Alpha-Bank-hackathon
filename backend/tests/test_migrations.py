from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

BACKEND = Path(__file__).resolve().parents[1]


@pytest.fixture
def alembic_cfg(pg_url):
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "migrations"))
    cfg.set_main_option("sqlalchemy.url", pg_url.render_as_string(hide_password=False).replace("%", "%%"))
    return cfg


@pytest.mark.medium
def test_upgrade_head_has_no_drift(alembic_cfg, pg_url) -> None:
    command.upgrade(alembic_cfg, "head")
    engine = create_engine(pg_url)
    tables = set(inspect(engine).get_table_names())
    engine.dispose()
    assert {"applications", "status_history", "source_checks", "rule_results"} <= tables
    command.check(alembic_cfg)
