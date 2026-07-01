"""M0: проверки схемы моделей «Доверенности» на уровне метаданных.

Эти тесты не требуют БД — они валидируют, что модель собрана корректно
(таблицы, ключевые колонки, enum-значения, ограничения уникальности).
DB-зависимые проверки CRUD появятся в M1.
"""

import app.models  # noqa: F401
from app.core.database import Base
from app.models import poa

META = Base.metadata.tables

POA_TABLES = {
    "poa_authority_categories",
    "poa_authorities",
    "poa_org_scopes",
    "poa_org_levels",
    "poa_authority_grants",
    "poa_limit_rules",
    "poa_employees",
    "poa_position_level_rules",
    "poa_authority_requests",
    "poa_resolved_grants",
    "poa_certificates",
    "poa_certificate_authorities",
    "poa_original_issues",
    "poa_audit",
}


def test_all_poa_tables_registered():
    present = {n for n in META if n.startswith("poa_")}
    assert present == POA_TABLES


def test_authority_core_columns():
    cols = META["poa_authorities"].columns.keys()
    for c in (
        "code", "category_id", "name_short", "text_full", "authority_kind",
        "deal_direction", "limit_class", "is_universal", "limit_applies",
        "is_no_limit", "status", "version",
    ):
        assert c in cols


def test_authority_code_unique():
    assert META["poa_authorities"].columns["code"].unique is True


def test_grant_cell_unique_constraint():
    uqs = {c.name for c in META["poa_authority_grants"].constraints if c.name}
    assert "uq_poa_grant_cell" in uqs


def test_limit_rule_unique_constraint():
    uqs = {c.name for c in META["poa_limit_rules"].constraints if c.name}
    assert "uq_poa_limit_rule" in uqs


def test_certificate_authorities_are_fk_not_text():
    # Перечень полномочий доверенности — association-таблица с FK на каталог.
    m2m = META["poa_certificate_authorities"]
    assert "authority_id" in m2m.columns
    assert "certificate_id" in m2m.columns


def test_enum_value_domains():
    assert [e.value for e in poa.DealDirection] == ["expense", "income", "na"]
    assert [e.value for e in poa.ScopeClass] == ["kc", "region_tier1", "region_tier2"]
    assert [e.value for e in poa.LevelSource] == ["manual", "derived", "hr"]
    assert [e.value for e in poa.CertificateType] == ["paper", "notarial", "mchd"]
    assert [e.value for e in poa.IssueMethod] == ["in_person", "ring_mail", "postal"]
    # LimitClass должен совпадать по домену с exception_kind в limit_rule.
    assert [e.value for e in poa.LimitClass] == [
        "general", "finance", "procurement", "infrastructure"
    ]


def test_ceo_levels_have_deal_flag():
    # CEO-4/-5 по умолчанию не заключают сделки — флаг присутствует в модели.
    assert "can_conclude_deals_default" in META["poa_org_levels"].columns


def test_employee_level_nullable_hybrid():
    # Гибрид: уровень может быть не задан, пока не введён вручную/из HR.
    assert META["poa_employees"].columns["org_level_id"].nullable is True
    assert "level_source" in META["poa_employees"].columns
