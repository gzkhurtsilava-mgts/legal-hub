"""document_versions: set newest version per document as is_current

Revision ID: e0f1a2b3c4d5
Revises: c3d4e5f6a7b8
Create Date: 2026-06-04
"""
from alembic import op

revision = 'e0f1a2b3c4d5'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        UPDATE document_versions
        SET is_current = TRUE
        WHERE id IN (
            SELECT DISTINCT ON (document_id) id
            FROM document_versions
            ORDER BY document_id, uploaded_at DESC
        )
    """)


def downgrade() -> None:
    op.execute("UPDATE document_versions SET is_current = FALSE")
