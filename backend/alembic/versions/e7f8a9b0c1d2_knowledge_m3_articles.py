"""knowledge M3: articles table

Revision ID: e7f8a9b0c1d2
Revises: d4e5f6a7b8c9
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'e7f8a9b0c1d2'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "articles",
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("content", JSONB(), nullable=True),
        sa.Column("attachments", JSONB(), nullable=False, server_default="[]"),
        sa.Column("toc_enabled", sa.Boolean(), nullable=False, server_default="false"),
    )

    # Seed article rows for existing article items
    op.execute("""
        INSERT INTO articles (item_id, content, attachments, toc_enabled)
        SELECT id, NULL, '[]', false
        FROM knowledge_items
        WHERE item_type = 'article'
        ON CONFLICT DO NOTHING
    """)


def downgrade() -> None:
    op.drop_table("articles")
