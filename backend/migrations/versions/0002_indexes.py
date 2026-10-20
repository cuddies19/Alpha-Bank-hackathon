"""indexes on application_id

Revision ID: 0002
Revises: 0001
"""

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

TABLES = ("status_history", "source_checks", "rule_results")


def upgrade() -> None:
    for table in TABLES:
        op.create_index(f"ix_{table}_application_id", table, ["application_id"])


def downgrade() -> None:
    for table in TABLES:
        op.drop_index(f"ix_{table}_application_id", table_name=table)
