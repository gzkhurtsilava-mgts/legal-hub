"""knowledge m2: search_vector generated column + GIN indexes

Revision ID: c1d2e3f4a5b6
Revises: e5f1a2b3c4d6
Create Date: 2026-06-03 02:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, None] = "e5f1a2b3c4d6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Generated stored column — computed from title, summary, content_text.
    # pg_trgm and unaccent already enabled in M0 migration.
    op.execute("""
        ALTER TABLE knowledge_items
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('russian', coalesce(summary, '')), 'B') ||
            setweight(to_tsvector('russian', coalesce(content_text, '')), 'C')
        ) STORED
    """)
    op.execute(
        "CREATE INDEX ix_knowledge_items_search_vector "
        "ON knowledge_items USING GIN (search_vector)"
    )
    # trigram on content_text for fuzzy full-text search
    op.execute(
        "CREATE INDEX ix_knowledge_items_content_trgm "
        "ON knowledge_items USING GIN (content_text gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_knowledge_items_content_trgm")
    op.execute("DROP INDEX IF EXISTS ix_knowledge_items_search_vector")
    op.execute("ALTER TABLE knowledge_items DROP COLUMN search_vector")
