import pytest
from alembic import command
from sqlalchemy import inspect


@pytest.mark.smoke
@pytest.mark.positive
def test_upgrade_head_has_no_drift(alembic_cfg, migrated_engine) -> None:
    tables = set(inspect(migrated_engine).get_table_names())
    assert {"applications", "status_history", "source_checks", "rule_results"} <= tables
    command.check(alembic_cfg)


@pytest.mark.positive
def test_trigger_removed_on_downgrade_and_back_on_upgrade(alembic_cfg, trigger_count) -> None:
    assert trigger_count() == 1
    command.downgrade(alembic_cfg, "0002")
    assert trigger_count() == 0
    command.upgrade(alembic_cfg, "head")
    assert trigger_count() == 1
