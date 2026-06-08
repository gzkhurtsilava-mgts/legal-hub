"""document_versions: add source_file fields (PDF is now primary)

Revision ID: f1a2b3c4d5e6
Revises: e0f1a2b3c4d5
Create Date: 2026-06-04
"""
from alembic import op
import sqlalchemy as sa

revision = 'f1a2b3c4d5e6'
down_revision = 'e0f1a2b3c4d5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("document_versions", sa.Column("source_filename", sa.String(500), nullable=True))
    op.add_column("document_versions", sa.Column("source_file_path", sa.String(1000), nullable=True))
    op.add_column("document_versions", sa.Column("source_file_size", sa.Integer(), nullable=True))
    op.add_column("document_versions", sa.Column("source_mime_type", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("document_versions", "source_mime_type")
    op.drop_column("document_versions", "source_file_size")
    op.drop_column("document_versions", "source_file_path")
    op.drop_column("document_versions", "source_filename")
