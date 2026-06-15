"""processes module M0: all pm_* tables

Revision ID: a2b3c4d5e6f7
Revises: e1f2a3b4c5d6
Create Date: 2026-06-15
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.dialects.postgresql import JSONB

revision = "a2b3c4d5e6f7"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None

# PgEnum (postgresql.ENUM) is used instead of sa.Enum throughout to bypass
# SQLAlchemy's generic type registry (which imports model Enums with create_type=True
# via env.py and ignores create_type=False on same-named sa.Enum instances).
# PgEnum respects create_type independently.

# Each named enum type is created exactly once (create_type=True on first use;
# create_type=False on all subsequent column references to the same type).

_bu_type = PgEnum("client", "self", "oversight", name="pm_bu_type")
_bu_type_ref = PgEnum("client", "self", "oversight", name="pm_bu_type", create_type=False)

_domain_category = PgEnum("core", "regulatory", "supporting", "management", name="pm_domain_category")

_cloc = PgEnum("reactive", "emerging", "developing", "leading", name="pm_cloc_maturity")
_cloc_ref = PgEnum("reactive", "emerging", "developing", "leading", name="pm_cloc_maturity", create_type=False)

_status = PgEnum("draft", "as_is", "to_be", name="pm_status")
_status_ref = PgEnum("draft", "as_is", "to_be", name="pm_status", create_type=False)

_process_type = PgEnum("workflow", "service", name="pm_process_type")

_bu_mode = PgEnum("all_clients", "specific", name="pm_bu_mode")

_activity_type = PgEnum("manual", "system", "decision", name="pm_activity_type")

_impact = PgEnum("high", "medium", "low", name="pm_impact")
_impact_ref = PgEnum("high", "medium", "low", name="pm_impact", create_type=False)

_metric_status = PgEnum("fact", "estimate", "no_data", name="pm_metric_status")


def upgrade() -> None:
    # ── Reference tables (no FK deps) ───────────────────────────────────────
    op.create_table(
        "pm_roles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pm_systems",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", sa.String(50), nullable=True),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pm_regulations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pm_policies",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pm_risks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pm_doc_types",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # ── pm_business_units — creates pm_bu_type ───────────────────────────────
    op.create_table(
        "pm_business_units",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", _bu_type, nullable=False, server_default="client"),
        sa.Column("legal_partner_role_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["legal_partner_role_id"], ["pm_roles.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # ── pm_domains — creates pm_domain_category, pm_cloc_maturity, pm_status ─
    op.create_table(
        "pm_domains",
        sa.Column("id", sa.String(20), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", _domain_category, nullable=False),
        sa.Column("mission", sa.Text(), nullable=True),
        sa.Column("scope_in", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("scope_out", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("owner_role_id", sa.Integer(), nullable=True),
        sa.Column("team_size", sa.Integer(), nullable=True),
        sa.Column("cloc_maturity_current", _cloc, nullable=True),
        sa.Column("cloc_maturity_target", _cloc_ref, nullable=True),
        sa.Column("status", _status, nullable=False, server_default="draft"),
        sa.Column("lifecycle_ref_id", sa.String(20), nullable=True),
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
        sa.ForeignKeyConstraint(["owner_role_id"], ["pm_roles.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["lifecycle_ref_id"], ["pm_domains.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── pm_processes — creates pm_process_type, pm_bu_mode (pm_status reused) ─
    op.create_table(
        "pm_processes",
        sa.Column("id", sa.String(40), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", _process_type, nullable=False),
        sa.Column("domain_id", sa.String(20), nullable=False),
        sa.Column("owner_role_id", sa.Integer(), nullable=True),
        sa.Column("version", sa.String(10), nullable=False, server_default="1.0"),
        sa.Column("status", _status_ref, nullable=False, server_default="draft"),
        sa.Column("lifecycle_ref_id", sa.String(40), nullable=True),
        sa.Column("last_updated", sa.Date(), nullable=True),
        sa.Column("next_review", sa.Date(), nullable=True),
        sa.Column("sirporc", JSONB(), server_default=sa.text("'{}'::jsonb"), nullable=True),
        sa.Column("bu_mode", _bu_mode, nullable=False, server_default="all_clients"),
        sa.Column("connections", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("changelog", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        # Workflow-specific
        sa.Column("sla_days", sa.Integer(), nullable=True),
        sa.Column("pain_points", JSONB(), nullable=True),
        sa.Column("bpmn_diagram", sa.Text(), nullable=True),
        # Service-specific
        sa.Column("required_competencies", JSONB(), nullable=True),
        sa.Column("effort_estimation", JSONB(), nullable=True),
        sa.Column("decision_points", JSONB(), nullable=True),
        sa.Column("case_library", JSONB(), nullable=True),
        sa.Column("improvement_candidates", JSONB(), nullable=True),
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
        sa.ForeignKeyConstraint(["domain_id"], ["pm_domains.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["owner_role_id"], ["pm_roles.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["lifecycle_ref_id"], ["pm_processes.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── pm_activities — creates pm_activity_type ─────────────────────────────
    op.create_table(
        "pm_activities",
        sa.Column("id", sa.String(60), nullable=False),
        sa.Column("parent_process_id", sa.String(40), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_optional", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("condition_note", sa.Text(), nullable=True),
        # Workflow-specific
        sa.Column("activity_type", _activity_type, nullable=True),
        sa.Column("raci_role_id", sa.Integer(), nullable=True),
        sa.Column("duration", sa.String(50), nullable=True),
        sa.Column("automation_potential", sa.Integer(), nullable=True),
        sa.Column("data_operations", JSONB(), nullable=True),
        sa.Column("decision_logic", JSONB(), nullable=True),
        # Service-specific
        sa.Column("phase_number", sa.Integer(), nullable=True),
        sa.Column("quality_criteria", JSONB(), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["parent_process_id"], ["pm_processes.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["raci_role_id"], ["pm_roles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── pm_sops ──────────────────────────────────────────────────────────────
    op.create_table(
        "pm_sops",
        sa.Column("id", sa.String(80), nullable=False),
        sa.Column("parent_activity_id", sa.String(60), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("audience_role_id", sa.Integer(), nullable=True),
        sa.Column("preconditions", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("steps", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("checklist", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("faq", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("related_docs", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
        sa.Column("changelog", JSONB(), server_default=sa.text("'[]'::jsonb"), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["parent_activity_id"], ["pm_activities.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["audience_role_id"], ["pm_roles.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── Junction tables for L3 ───────────────────────────────────────────────
    op.create_table(
        "pm_process_business_units",
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("bu_id", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["bu_id"], ["pm_business_units.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("process_id", "bu_id"),
    )

    op.create_table(
        "pm_process_systems",
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("system_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["system_id"], ["pm_systems.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("process_id", "system_id"),
    )

    op.create_table(
        "pm_process_regulations",
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("reg_id", sa.Integer(), nullable=False),
        sa.Column("articles", sa.Text(), nullable=True),
        sa.Column("relevance_note", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reg_id"], ["pm_regulations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("process_id", "reg_id"),
    )

    # ── pm_process_risks — creates pm_impact ─────────────────────────────────
    op.create_table(
        "pm_process_risks",
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("risk_id", sa.Integer(), nullable=False),
        sa.Column("impact", _impact, nullable=True),
        sa.Column("probability", _impact_ref, nullable=True),
        sa.Column("control", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["risk_id"], ["pm_risks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("process_id", "risk_id"),
    )

    op.create_table(
        "pm_process_raci",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("activity_id", sa.String(60), nullable=True),
        sa.Column("r", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("a", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("c", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("i", sa.Boolean(), nullable=False, server_default="false"),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["role_id"], ["pm_roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["activity_id"], ["pm_activities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── pm_process_metrics — creates pm_metric_status ────────────────────────
    op.create_table(
        "pm_process_metrics",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("value", sa.String(100), nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("metric_status", _metric_status, nullable=False, server_default="no_data"),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "pm_automation_candidates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("process_id", sa.String(40), nullable=False),
        sa.Column("idea", sa.Text(), nullable=False),
        sa.Column("impact", sa.String(50), nullable=True),
        sa.Column("effort", sa.String(50), nullable=True),
        sa.Column("score", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["process_id"], ["pm_processes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("pm_automation_candidates")
    op.drop_table("pm_process_metrics")
    op.drop_table("pm_process_raci")
    op.drop_table("pm_process_risks")
    op.drop_table("pm_process_regulations")
    op.drop_table("pm_process_systems")
    op.drop_table("pm_process_business_units")
    op.drop_table("pm_sops")
    op.drop_table("pm_activities")
    op.drop_table("pm_processes")
    op.drop_table("pm_domains")
    op.drop_table("pm_business_units")
    op.drop_table("pm_doc_types")
    op.drop_table("pm_risks")
    op.drop_table("pm_policies")
    op.drop_table("pm_regulations")
    op.drop_table("pm_systems")
    op.drop_table("pm_roles")

    # Drop enum types (only drop each once)
    _metric_status.drop(op.get_bind())
    _impact.drop(op.get_bind())
    _activity_type.drop(op.get_bind())
    _bu_mode.drop(op.get_bind())
    _process_type.drop(op.get_bind())
    _status.drop(op.get_bind())
    _cloc.drop(op.get_bind())
    _domain_category.drop(op.get_bind())
    _bu_type.drop(op.get_bind())
