"""knowledge M5: links and faqs tables

Revision ID: a1b2c3d4e5f6
Revises: f0a1b2c3d4e5
Create Date: 2026-06-04
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = 'f0a1b2c3d4e5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "links",
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("url", sa.String(2048), nullable=False, server_default=""),
    )

    op.create_table(
        "faqs",
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("answer", sa.Text(), nullable=False, server_default=""),
    )

    # Seed rows for existing items of these types
    op.execute("""
        INSERT INTO links (item_id, url)
        SELECT id, '' FROM knowledge_items WHERE item_type = 'link'
        ON CONFLICT DO NOTHING
    """)
    op.execute("""
        INSERT INTO faqs (item_id, answer)
        SELECT id, '' FROM knowledge_items WHERE item_type = 'faq'
        ON CONFLICT DO NOTHING
    """)


def downgrade() -> None:
    op.drop_table("faqs")
    op.drop_table("links")
