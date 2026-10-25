"""pipeline notify trigger and applications.recommendation

Revision ID: c1d2e3f4a5b6
Revises: b5f2a2403fb8
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c1d2e3f4a5b6"
down_revision: str | None = "b5f2a2403fb8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("recommendation", sa.JSON(), nullable=True))
    if op.get_bind().dialect.name != "postgresql":
        return
    op.execute(
        """
        CREATE FUNCTION notify_application_submitted() RETURNS trigger AS $$
        BEGIN
            IF NEW.status = 'submitted'
               AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'submitted') THEN
                PERFORM pg_notify('applications_submitted', NEW.id::text);
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """
    )
    op.execute(
        """
        CREATE TRIGGER applications_notify_submitted
        AFTER INSERT OR UPDATE OF status ON applications
        FOR EACH ROW EXECUTE FUNCTION notify_application_submitted()
        """
    )


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP TRIGGER applications_notify_submitted ON applications")
        op.execute("DROP FUNCTION notify_application_submitted()")
    op.drop_column("applications", "recommendation")
