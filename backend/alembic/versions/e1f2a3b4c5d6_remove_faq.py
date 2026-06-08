"""remove FAQ: drop faqs table, remove faq from item_type enum

Revision ID: e1f2a3b4c5d6
Revises: f1a2b3c4d5e6
Create Date: 2026-06-05
"""
from alembic import op
import sqlalchemy as sa

revision = 'e1f2a3b4c5d6'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Delete all FAQ knowledge items (CASCADE removes faqs rows automatically)
    op.execute("DELETE FROM knowledge_items WHERE item_type = 'faq'")

    # Drop faqs table
    op.drop_table("faqs")

    # Remove 'faq' from knowledge_item_type enum
    # PostgreSQL doesn't support DROP VALUE, so we recreate the type
    op.execute("CREATE TYPE knowledge_item_type_new AS ENUM ('article', 'document', 'link')")
    op.execute("""
        ALTER TABLE knowledge_items
            ALTER COLUMN item_type TYPE knowledge_item_type_new
            USING item_type::text::knowledge_item_type_new
    """)
    op.execute("DROP TYPE knowledge_item_type")
    op.execute("ALTER TYPE knowledge_item_type_new RENAME TO knowledge_item_type")


def downgrade() -> None:
    op.execute("CREATE TYPE knowledge_item_type_new AS ENUM ('article', 'document', 'link', 'faq')")
    op.execute("""
        ALTER TABLE knowledge_items
            ALTER COLUMN item_type TYPE knowledge_item_type_new
            USING item_type::text::knowledge_item_type_new
    """)
    op.execute("DROP TYPE knowledge_item_type")
    op.execute("ALTER TYPE knowledge_item_type_new RENAME TO knowledge_item_type")

    op.create_table(
        "faqs",
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("entries", sa.dialects.postgresql.JSONB(), nullable=False, server_default="[]"),
    )
