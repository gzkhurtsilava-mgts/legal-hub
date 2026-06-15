"""processes: simplify pm_domains — drop unused columns

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-06-15
"""

from alembic import op

revision = "b3c4d5e6f7a8"
down_revision = "a2b3c4d5e6f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # CASCADE drops FK constraints automatically when dropping referencing columns
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS category CASCADE")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS status CASCADE")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS scope_in")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS scope_out")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS owner_role_id CASCADE")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS team_size")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS cloc_maturity_current")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS cloc_maturity_target")
    op.execute("ALTER TABLE pm_domains DROP COLUMN IF EXISTS lifecycle_ref_id CASCADE")
    op.execute("DROP TYPE IF EXISTS pm_domain_category")
    op.execute("DROP TYPE IF EXISTS pm_cloc_maturity")


def downgrade() -> None:
    op.execute("CREATE TYPE pm_domain_category AS ENUM ('core', 'regulatory', 'supporting', 'management')")
    op.execute("CREATE TYPE pm_cloc_maturity AS ENUM ('reactive', 'emerging', 'developing', 'leading')")
    op.execute("ALTER TABLE pm_domains ADD COLUMN category pm_domain_category NOT NULL DEFAULT 'core'")
    op.execute("ALTER TABLE pm_domains ADD COLUMN status pm_status NOT NULL DEFAULT 'draft'")
    op.execute("ALTER TABLE pm_domains ADD COLUMN scope_in JSONB DEFAULT '[]'::jsonb")
    op.execute("ALTER TABLE pm_domains ADD COLUMN scope_out JSONB DEFAULT '[]'::jsonb")
    op.execute("ALTER TABLE pm_domains ADD COLUMN owner_role_id INTEGER REFERENCES pm_roles(id) ON DELETE SET NULL")
    op.execute("ALTER TABLE pm_domains ADD COLUMN team_size INTEGER")
    op.execute("ALTER TABLE pm_domains ADD COLUMN cloc_maturity_current pm_cloc_maturity")
    op.execute("ALTER TABLE pm_domains ADD COLUMN cloc_maturity_target pm_cloc_maturity")
    op.execute("ALTER TABLE pm_domains ADD COLUMN lifecycle_ref_id VARCHAR(20) REFERENCES pm_domains(id) ON DELETE SET NULL")
