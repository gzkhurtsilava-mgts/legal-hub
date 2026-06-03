"""knowledge base m0: extensions + sections + knowledge_items

Revision ID: 3b4c9de71a2f
Revises: f9c88e895420
Create Date: 2026-06-03 00:00:00.000000+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "3b4c9de71a2f"
down_revision: Union[str, None] = "f9c88e895420"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Extensions ---
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")

    # --- Sections ---
    op.create_table(
        "sections",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(length=100), nullable=True),
        sa.Column("order_index", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "visibility",
            sa.Enum("public", "bpo_only", name="knowledge_visibility"),
            server_default="public",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["parent_id"], ["sections.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_sections_slug"),
    )

    # --- Section lawyers (m2m) ---
    op.create_table(
        "section_lawyers",
        sa.Column("section_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["section_id"], ["sections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("section_id", "user_id"),
    )

    # --- Knowledge items ---
    op.create_table(
        "knowledge_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("section_id", sa.Integer(), nullable=False),
        sa.Column(
            "item_type",
            sa.Enum("article", "document", "link", "faq", name="knowledge_item_type"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column(
            "visibility",
            sa.Enum("public", "bpo_only", name="knowledge_visibility"),
            server_default="public",
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("draft", "published", "archived", name="knowledge_item_status"),
            server_default="draft",
            nullable=False,
        ),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("content_text", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["section_id"], ["sections.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Basic indexes for filtering
    op.create_index("ix_knowledge_items_section_id", "knowledge_items", ["section_id"])
    op.create_index("ix_knowledge_items_status", "knowledge_items", ["status"])
    op.create_index("ix_knowledge_items_item_type", "knowledge_items", ["item_type"])
    op.create_index("ix_knowledge_items_author_id", "knowledge_items", ["author_id"])

    # Trigram index on title for fast typeahead (pg_trgm enabled above)
    op.execute(
        "CREATE INDEX ix_knowledge_items_title_trgm "
        "ON knowledge_items USING GIN (title gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_knowledge_items_title_trgm")
    op.drop_index("ix_knowledge_items_author_id", table_name="knowledge_items")
    op.drop_index("ix_knowledge_items_item_type", table_name="knowledge_items")
    op.drop_index("ix_knowledge_items_status", table_name="knowledge_items")
    op.drop_index("ix_knowledge_items_section_id", table_name="knowledge_items")
    op.drop_table("knowledge_items")
    op.drop_table("section_lawyers")
    op.drop_table("sections")
    sa.Enum(name="knowledge_item_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="knowledge_item_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="knowledge_visibility").drop(op.get_bind(), checkfirst=True)
