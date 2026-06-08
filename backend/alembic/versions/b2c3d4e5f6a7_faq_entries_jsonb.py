"""knowledge M5b: faq answer TEXT -> entries JSONB

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-04
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("faqs", sa.Column("entries", JSONB(), nullable=False, server_default="[]"))
    # Migrate existing text answers into entries format
    op.execute("""
        UPDATE faqs
        SET entries = jsonb_build_array(
            jsonb_build_object(
                'id', gen_random_uuid()::text,
                'question', '',
                'answer', answer
            )
        )
        WHERE answer IS NOT NULL AND answer != ''
    """)
    op.drop_column("faqs", "answer")


def downgrade() -> None:
    op.add_column("faqs", sa.Column("answer", sa.Text(), nullable=False, server_default=""))
    op.execute("""
        UPDATE faqs
        SET answer = COALESCE((entries->0->>'answer'), '')
    """)
    op.drop_column("faqs", "entries")
