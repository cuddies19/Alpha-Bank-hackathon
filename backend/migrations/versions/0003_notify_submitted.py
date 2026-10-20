"""notify the worker when an application becomes submitted

Revision ID: 0003
Revises: 0002
"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
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
    op.execute("DROP TRIGGER applications_notify_submitted ON applications")
    op.execute("DROP FUNCTION notify_application_submitted()")
