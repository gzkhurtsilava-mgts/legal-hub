"""poa: org refactor (scopes source/external_id, grants without level, limits per level) + indexes

Дельта, ранее ошибочно внесённая правкой a7b1c2d3e4f5 на месте. Ревизия
идемпотентна (IF EXISTS / IF NOT EXISTS): применяется и к БД со старой схемой
(корп-машина, main), и к БД, уже получившей новую схему из правленого M0
(локальная разработка).

Содержимое дельты:
- poa_org_scopes: is_corporate_center/region_tier → source/external_id
- poa_org_levels: минус can_conclude_deals_default
- poa_authorities: минус limit_class
- poa_authority_grants: минус org_level_id/limit_override/no_limit/
  sub_delegation_only; уникальность ячейки = (authority_id, org_scope_id)
- poa_limit_rules: минус scope_class/exception_kind/deal_direction;
  уникальность = (org_level_id)
- poa_scope_type: + division, unit; новый enum poa_org_source
- неиспользуемые типы poa_limit_class/poa_region_tier/poa_scope_class удаляются
  (значение sub_delegation в poa_resolved_derivation остаётся: PostgreSQL не
  умеет удалять значения enum; оно безвредно)
- индексы под чтение реестра/кабинета: poa_certificates(status, valid_to),
  (grantee_fio), (grantee_employee_id); poa_employees(fio)

Revision ID: b8c9d0e1f2a3
Revises: a7b1c2d3e4f5
Create Date: 2026-07-21
"""

from alembic import op

revision = "b8c9d0e1f2a3"
down_revision = "a7b1c2d3e4f5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enum-типы ────────────────────────────────────────────────────────────
    op.execute("ALTER TYPE poa_scope_type ADD VALUE IF NOT EXISTS 'division'")
    op.execute("ALTER TYPE poa_scope_type ADD VALUE IF NOT EXISTS 'unit'")
    op.execute(
        "DO $$ BEGIN CREATE TYPE poa_org_source AS ENUM ('manual', 'hrgate'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    )

    # ── poa_org_scopes ───────────────────────────────────────────────────────
    op.execute("ALTER TABLE poa_org_scopes DROP COLUMN IF EXISTS is_corporate_center")
    op.execute("ALTER TABLE poa_org_scopes DROP COLUMN IF EXISTS region_tier")
    op.execute(
        "ALTER TABLE poa_org_scopes ADD COLUMN IF NOT EXISTS "
        "source poa_org_source NOT NULL DEFAULT 'manual'"
    )
    op.execute(
        "ALTER TABLE poa_org_scopes ADD COLUMN IF NOT EXISTS external_id varchar(100)"
    )

    # ── poa_org_levels / poa_authorities ────────────────────────────────────
    op.execute("ALTER TABLE poa_org_levels DROP COLUMN IF EXISTS can_conclude_deals_default")
    op.execute("ALTER TABLE poa_authorities DROP COLUMN IF EXISTS limit_class")

    # ── poa_authority_grants: ячейка без уровня ─────────────────────────────
    op.execute("ALTER TABLE poa_authority_grants DROP CONSTRAINT IF EXISTS uq_poa_grant_cell")
    op.execute("ALTER TABLE poa_authority_grants DROP COLUMN IF EXISTS org_level_id")
    op.execute("ALTER TABLE poa_authority_grants DROP COLUMN IF EXISTS limit_override")
    op.execute("ALTER TABLE poa_authority_grants DROP COLUMN IF EXISTS no_limit")
    op.execute("ALTER TABLE poa_authority_grants DROP COLUMN IF EXISTS sub_delegation_only")
    # После удаления org_level_id возможны дубли ячеек (одно полномочие × узел
    # на разных уровнях) — оставляем строку с минимальным id.
    op.execute(
        "DELETE FROM poa_authority_grants a USING poa_authority_grants b "
        "WHERE a.id > b.id AND a.authority_id = b.authority_id "
        "AND a.org_scope_id IS NOT DISTINCT FROM b.org_scope_id"
    )
    op.execute(
        "DO $$ BEGIN ALTER TABLE poa_authority_grants "
        "ADD CONSTRAINT uq_poa_grant_cell UNIQUE (authority_id, org_scope_id); "
        "EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$"
    )

    # ── poa_limit_rules: один потолок на уровень ────────────────────────────
    op.execute("ALTER TABLE poa_limit_rules DROP CONSTRAINT IF EXISTS uq_poa_limit_rule")
    op.execute("ALTER TABLE poa_limit_rules DROP COLUMN IF EXISTS scope_class")
    op.execute("ALTER TABLE poa_limit_rules DROP COLUMN IF EXISTS exception_kind")
    op.execute("ALTER TABLE poa_limit_rules DROP COLUMN IF EXISTS deal_direction")
    op.execute(
        "DELETE FROM poa_limit_rules a USING poa_limit_rules b "
        "WHERE a.id > b.id AND a.org_level_id = b.org_level_id"
    )
    op.execute(
        "DO $$ BEGIN ALTER TABLE poa_limit_rules "
        "ADD CONSTRAINT uq_poa_limit_rule UNIQUE (org_level_id); "
        "EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$"
    )

    # ── Материализация: строки старой схемы невалидны — очищаем ─────────────
    # (перегенерируется кнопкой «Пересчитать» или первым изменением матрицы)
    op.execute("DELETE FROM poa_resolved_grants")

    # ── Неиспользуемые enum-типы старой схемы ────────────────────────────────
    op.execute("DROP TYPE IF EXISTS poa_limit_class")
    op.execute("DROP TYPE IF EXISTS poa_region_tier")
    op.execute("DROP TYPE IF EXISTS poa_scope_class")

    # ── Индексы под горячие чтения (реестр, личный кабинет) ─────────────────
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_poa_certificates_status_valid_to "
        "ON poa_certificates (status, valid_to)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_poa_certificates_grantee_fio "
        "ON poa_certificates (grantee_fio)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_poa_certificates_grantee_employee_id "
        "ON poa_certificates (grantee_employee_id)"
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_poa_employees_fio ON poa_employees (fio)")


def downgrade() -> None:
    # Структурный откат без восстановления данных старых колонок.
    op.execute("DROP INDEX IF EXISTS ix_poa_employees_fio")
    op.execute("DROP INDEX IF EXISTS ix_poa_certificates_grantee_employee_id")
    op.execute("DROP INDEX IF EXISTS ix_poa_certificates_grantee_fio")
    op.execute("DROP INDEX IF EXISTS ix_poa_certificates_status_valid_to")

    op.execute(
        "DO $$ BEGIN CREATE TYPE poa_limit_class AS ENUM "
        "('general', 'finance', 'procurement', 'infrastructure'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    )
    op.execute(
        "DO $$ BEGIN CREATE TYPE poa_region_tier AS ENUM ('tier1', 'tier2'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    )
    op.execute(
        "DO $$ BEGIN CREATE TYPE poa_scope_class AS ENUM "
        "('kc', 'region_tier1', 'region_tier2'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; END $$"
    )

    op.execute("DELETE FROM poa_resolved_grants")

    op.execute("ALTER TABLE poa_limit_rules DROP CONSTRAINT IF EXISTS uq_poa_limit_rule")
    op.execute(
        "ALTER TABLE poa_limit_rules ADD COLUMN IF NOT EXISTS "
        "scope_class poa_scope_class NOT NULL DEFAULT 'kc'"
    )
    op.execute(
        "ALTER TABLE poa_limit_rules ADD COLUMN IF NOT EXISTS "
        "exception_kind poa_limit_class NOT NULL DEFAULT 'general'"
    )
    op.execute(
        "ALTER TABLE poa_limit_rules ADD COLUMN IF NOT EXISTS "
        "deal_direction poa_deal_direction NOT NULL DEFAULT 'expense'"
    )
    op.execute(
        "DO $$ BEGIN ALTER TABLE poa_limit_rules ADD CONSTRAINT uq_poa_limit_rule "
        "UNIQUE (scope_class, org_level_id, exception_kind, deal_direction); "
        "EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$"
    )

    op.execute("ALTER TABLE poa_authority_grants DROP CONSTRAINT IF EXISTS uq_poa_grant_cell")
    op.execute(
        "ALTER TABLE poa_authority_grants ADD COLUMN IF NOT EXISTS org_level_id integer "
        "REFERENCES poa_org_levels(id) ON DELETE CASCADE"
    )
    op.execute(
        "ALTER TABLE poa_authority_grants ADD COLUMN IF NOT EXISTS "
        "limit_override numeric(18, 2)"
    )
    op.execute(
        "ALTER TABLE poa_authority_grants ADD COLUMN IF NOT EXISTS "
        "no_limit boolean NOT NULL DEFAULT false"
    )
    op.execute(
        "ALTER TABLE poa_authority_grants ADD COLUMN IF NOT EXISTS "
        "sub_delegation_only boolean NOT NULL DEFAULT false"
    )
    op.execute(
        "DO $$ BEGIN ALTER TABLE poa_authority_grants ADD CONSTRAINT uq_poa_grant_cell "
        "UNIQUE (authority_id, org_scope_id, org_level_id); "
        "EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; END $$"
    )

    op.execute(
        "ALTER TABLE poa_authorities ADD COLUMN IF NOT EXISTS limit_class poa_limit_class"
    )
    op.execute(
        "ALTER TABLE poa_org_levels ADD COLUMN IF NOT EXISTS "
        "can_conclude_deals_default boolean NOT NULL DEFAULT true"
    )

    op.execute("ALTER TABLE poa_org_scopes DROP COLUMN IF EXISTS source")
    op.execute("ALTER TABLE poa_org_scopes DROP COLUMN IF EXISTS external_id")
    op.execute(
        "ALTER TABLE poa_org_scopes ADD COLUMN IF NOT EXISTS "
        "is_corporate_center boolean NOT NULL DEFAULT false"
    )
    op.execute(
        "ALTER TABLE poa_org_scopes ADD COLUMN IF NOT EXISTS region_tier poa_region_tier"
    )
    op.execute("DROP TYPE IF EXISTS poa_org_source")
