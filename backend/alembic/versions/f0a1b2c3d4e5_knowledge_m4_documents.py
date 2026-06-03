"""knowledge M4: documents and document_versions tables

Revision ID: f0a1b2c3d4e5
Revises: e7f8a9b0c1d2
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'f0a1b2c3d4e5'
down_revision = 'e7f8a9b0c1d2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
    )

    preview_status_enum = sa.Enum(
        "pending", "processing", "ready", "failed", "na",
        name="preview_status",
    )
    op.create_table(
        "document_versions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.item_id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_label", sa.String(100), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column("original_filename", sa.String(500), nullable=False),
        sa.Column("original_file_path", sa.String(1000), nullable=False),
        sa.Column("original_mime_type", sa.String(200), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("preview_status", preview_status_enum, nullable=False, server_default="pending"),
        sa.Column("preview_data", JSONB(), nullable=True),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("uploaded_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_document_versions_document_id", "document_versions", ["document_id"])

    # Seed document rows for existing document items
    op.execute("""
        INSERT INTO documents (item_id)
        SELECT id FROM knowledge_items WHERE item_type = 'document'
        ON CONFLICT DO NOTHING
    """)


def downgrade() -> None:
    op.drop_table("document_versions")
    op.drop_table("documents")
    sa.Enum(name="preview_status").drop(op.get_bind(), checkfirst=True)
