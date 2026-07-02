"""doverennosti (poa) module M0: base of authorities + registry tables

Revision ID: a7b1c2d3e4f5
Revises: b3c4d5e6f7a8
Create Date: 2026-07-01
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.dialects.postgresql import JSONB

from alembic import op

revision = "a7b1c2d3e4f5"
down_revision = "b3c4d5e6f7a8"
branch_labels = None
depends_on = None

# PgEnum вместо sa.Enum — чтобы независимо управлять create_type (см. пояснение
# в a2b3c4d5e6f7_processes_m0.py). Каждый именованный тип создаётся ровно один раз
# (create_type=True на первом использовании; create_type=False на последующих).

_authority_kind = PgEnum("deal", "representation", "action", name="poa_authority_kind")

_deal_direction = PgEnum("expense", "income", "na", name="poa_deal_direction")
_deal_direction_ref = PgEnum(
    "expense", "income", "na", name="poa_deal_direction", create_type=False
)

_authority_status = PgEnum("draft", "active", "archived", name="poa_authority_status")

_limit_class = PgEnum(
    "general", "finance", "procurement", "infrastructure", name="poa_limit_class"
)
_limit_class_ref = PgEnum(
    "general", "finance", "procurement", "infrastructure",
    name="poa_limit_class", create_type=False,
)

_scope_type = PgEnum("metablock", "block", "department", name="poa_scope_type")
_region_tier = PgEnum("tier1", "tier2", name="poa_region_tier")
_scope_class = PgEnum("kc", "region_tier1", "region_tier2", name="poa_scope_class")

_grant_derivation = PgEnum(
    "base_rule", "cascade", "manual_exception", name="poa_grant_derivation"
)
_resolved_derivation = PgEnum(
    "base_rule", "cascade", "universal", "manual_exception",
    name="poa_resolved_derivation",
)

_request_status = PgEnum("pending", "approved", "rejected", name="poa_request_status")
_level_source = PgEnum("manual", "derived", "hr", name="poa_level_source")

_certificate_type = PgEnum("paper", "notarial", "mchd", name="poa_certificate_type")
_certificate_status = PgEnum("active", "revoked", "expired", name="poa_certificate_status")
_issue_method = PgEnum("in_person", "ring_mail", "postal", name="poa_issue_method")
_audit_action = PgEnum(
    "create", "update", "delete", "generate", "approve", "reject", name="poa_audit_action"
)

_ALL_ENUM_NAMES = [
    "poa_authority_kind", "poa_deal_direction", "poa_authority_status", "poa_limit_class",
    "poa_scope_type", "poa_region_tier", "poa_scope_class", "poa_grant_derivation",
    "poa_resolved_derivation", "poa_request_status", "poa_level_source",
    "poa_certificate_type", "poa_certificate_status", "poa_issue_method", "poa_audit_action",
]


def _ts(name="created_at"):
    return sa.Column(name, sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False)


def upgrade() -> None:
    # ── Деревья и уровни (без внешних FK, кроме self-ref) ───────────────────
    op.create_table(
        "poa_authority_categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(500), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["poa_authority_categories.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "poa_org_scopes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("scope_type", _scope_type, nullable=False),
        sa.Column("name", sa.String(500), nullable=False),
        sa.Column("company", sa.String(100), nullable=False),
        sa.Column("is_corporate_center", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("region_tier", _region_tier, nullable=True),
        _ts(),
        sa.ForeignKeyConstraint(["parent_id"], ["poa_org_scopes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "poa_org_levels",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(20), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.UniqueConstraint("rank"),
    )

    # ── Каталог полномочий ──────────────────────────────────────────────────
    op.create_table(
        "poa_authorities",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("name_short", sa.String(500), nullable=False),
        sa.Column("text_full", sa.Text(), nullable=False),
        sa.Column("authority_kind", _authority_kind, nullable=False),
        sa.Column("deal_direction", _deal_direction, server_default="na", nullable=False),
        sa.Column("limit_class", _limit_class, nullable=True),
        sa.Column("is_universal", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("limit_applies", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("is_no_limit", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("legal_basis", sa.Text(), nullable=True),
        sa.Column("status", _authority_status, server_default="draft", nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_to", sa.Date(), nullable=True),
        sa.Column("updated_by", sa.String(255), nullable=True),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["category_id"], ["poa_authority_categories.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    # ── Матрица выдачи (авторские правила) ──────────────────────────────────
    op.create_table(
        "poa_authority_grants",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("authority_id", sa.Integer(), nullable=False),
        sa.Column("org_scope_id", sa.Integer(), nullable=True),
        sa.Column("org_level_id", sa.Integer(), nullable=False),
        sa.Column("granted", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("limit_override", sa.Numeric(18, 2), nullable=True),
        sa.Column("no_limit", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("derivation", _grant_derivation, server_default="base_rule", nullable=False),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["authority_id"], ["poa_authorities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["org_scope_id"], ["poa_org_scopes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["org_level_id"], ["poa_org_levels.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("authority_id", "org_scope_id", "org_level_id", name="uq_poa_grant_cell"),
    )

    # ── Блок лимитов ────────────────────────────────────────────────────────
    op.create_table(
        "poa_limit_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("scope_class", _scope_class, nullable=False),
        sa.Column("org_level_id", sa.Integer(), nullable=False),
        sa.Column("exception_kind", _limit_class_ref, nullable=False),
        sa.Column("amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="RUB", nullable=False),
        sa.Column("deal_direction", _deal_direction_ref, server_default="expense", nullable=False),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["org_level_id"], ["poa_org_levels.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "scope_class", "org_level_id", "exception_kind", "deal_direction",
            name="uq_poa_limit_rule",
        ),
    )

    # ── Сотрудники и деривация уровня ───────────────────────────────────────
    op.create_table(
        "poa_employees",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("fio", sa.String(500), nullable=False),
        sa.Column("position", sa.String(500), nullable=True),
        sa.Column("company", sa.String(100), nullable=False),
        sa.Column("org_scope_id", sa.Integer(), nullable=True),
        sa.Column("org_level_id", sa.Integer(), nullable=True),
        sa.Column("level_source", _level_source, server_default="manual", nullable=False),
        sa.Column("tab_number", sa.String(50), nullable=True),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["org_scope_id"], ["poa_org_scopes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["org_level_id"], ["poa_org_levels.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "poa_position_level_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("position_pattern", sa.String(500), nullable=False),
        sa.Column("org_level_id", sa.Integer(), nullable=False),
        sa.Column("priority", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["org_level_id"], ["poa_org_levels.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── Заявки на полномочия ────────────────────────────────────────────────
    op.create_table(
        "poa_authority_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("authority_id", sa.Integer(), nullable=True),
        sa.Column("proposed_text", sa.Text(), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("status", _request_status, server_default="pending", nullable=False),
        sa.Column("approver", sa.String(255), nullable=True),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["employee_id"], ["poa_employees.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["authority_id"], ["poa_authorities.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── Материализация резолвинга ───────────────────────────────────────────
    op.create_table(
        "poa_resolved_grants",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("org_scope_id", sa.Integer(), nullable=True),
        sa.Column("org_level_id", sa.Integer(), nullable=False),
        sa.Column("authority_id", sa.Integer(), nullable=False),
        sa.Column("granted", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("effective_limit", sa.Numeric(18, 2), nullable=True),
        sa.Column("no_limit", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("unlimited", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("derivation", _resolved_derivation, nullable=False),
        sa.Column("source_grant_id", sa.Integer(), nullable=True),
        _ts("generated_at"),
        sa.ForeignKeyConstraint(["org_scope_id"], ["poa_org_scopes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["org_level_id"], ["poa_org_levels.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["authority_id"], ["poa_authorities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_grant_id"], ["poa_authority_grants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_poa_resolved_scope_level", "poa_resolved_grants", ["org_scope_id", "org_level_id"]
    )

    # ── Реестр доверенностей ────────────────────────────────────────────────
    op.create_table(
        "poa_certificates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("number", sa.String(100), nullable=False),
        sa.Column("grantor_company", sa.String(200), nullable=False),
        sa.Column("grantee_employee_id", sa.Integer(), nullable=True),
        sa.Column("grantee_fio", sa.String(500), nullable=False),
        sa.Column("grantee_position", sa.String(500), nullable=True),
        sa.Column("grantee_tab_number", sa.String(50), nullable=True),
        sa.Column("cert_type", _certificate_type, nullable=False),
        sa.Column("issued_date", sa.Date(), nullable=False),
        sa.Column("valid_to", sa.Date(), nullable=True),
        sa.Column("limits", JSONB(), nullable=True),
        sa.Column("signer", sa.String(500), nullable=True),
        sa.Column("registration_data", sa.String(500), nullable=True),
        sa.Column("scan_path", sa.String(1000), nullable=True),
        sa.Column("basis_request_id", sa.Integer(), nullable=True),
        sa.Column("status", _certificate_status, server_default="active", nullable=False),
        _ts(),
        _ts("updated_at"),
        sa.ForeignKeyConstraint(["grantee_employee_id"], ["poa_employees.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["basis_request_id"], ["poa_authority_requests.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("number"),
    )

    op.create_table(
        "poa_certificate_authorities",
        sa.Column("certificate_id", sa.Integer(), nullable=False),
        sa.Column("authority_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["certificate_id"], ["poa_certificates.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["authority_id"], ["poa_authorities.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("certificate_id", "authority_id"),
    )

    op.create_table(
        "poa_original_issues",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("certificate_id", sa.Integer(), nullable=False),
        sa.Column("recipient_fio", sa.String(500), nullable=False),
        sa.Column("issued_date", sa.Date(), nullable=False),
        sa.Column("method", _issue_method, nullable=False),
        sa.Column("confirmed", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("confirmation_note", sa.String(500), nullable=True),
        _ts(),
        sa.ForeignKeyConstraint(["certificate_id"], ["poa_certificates.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── Аудит ───────────────────────────────────────────────────────────────
    op.create_table(
        "poa_audit",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("action", _audit_action, nullable=False),
        sa.Column("diff", JSONB(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        _ts("at"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_poa_audit_entity", "poa_audit", ["entity_type", "entity_id"])


def downgrade() -> None:
    op.drop_index("ix_poa_audit_entity", table_name="poa_audit")
    op.drop_table("poa_audit")
    op.drop_table("poa_original_issues")
    op.drop_table("poa_certificate_authorities")
    op.drop_table("poa_certificates")
    op.drop_index("ix_poa_resolved_scope_level", table_name="poa_resolved_grants")
    op.drop_table("poa_resolved_grants")
    op.drop_table("poa_authority_requests")
    op.drop_table("poa_position_level_rules")
    op.drop_table("poa_employees")
    op.drop_table("poa_limit_rules")
    op.drop_table("poa_authority_grants")
    op.drop_table("poa_authorities")
    op.drop_table("poa_org_levels")
    op.drop_table("poa_org_scopes")
    op.drop_table("poa_authority_categories")

    bind = op.get_bind()
    for name in _ALL_ENUM_NAMES:
        PgEnum(name=name).drop(bind, checkfirst=True)
