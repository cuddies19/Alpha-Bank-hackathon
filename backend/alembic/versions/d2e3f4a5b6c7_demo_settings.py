"""demo_settings: pipeline speed shared between the api and the worker

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d2e3f4a5b6c7"
down_revision: str | None = "c1d2e3f4a5b6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "demo_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("speed_multiplier", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_demo_settings")),
    )
    op.execute("INSERT INTO demo_settings (id, speed_multiplier) VALUES (1, 1.0)")


def downgrade() -> None:
    op.drop_table("demo_settings")
