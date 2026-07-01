"""Модуль «Доверенности» — модели данных.

Фундамент: единая база полномочий (Модуль 1) + реестр выданных доверенностей
(Модуль 2). Стиль повторяет app/models/knowledge.py (Column-декларации,
именованные enum-типы, timestamps через func.now()).

Именование enum-типов: префикс poa_ во избежание коллизий с другими модулями.
"""

import enum

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

# ─── Enums ────────────────────────────────────────────────────────────────────

class AuthorityKind(str, enum.Enum):
    deal = "deal"                     # сделки / подписание
    representation = "representation"  # иные виды представительства
    action = "action"                 # универсальные действия


class DealDirection(str, enum.Enum):
    expense = "expense"  # расходная — подпадает под финансовые лимиты
    income = "income"    # доходная — любые суммы, лимит не применяется
    na = "na"            # неприменимо


class AuthorityStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    archived = "archived"


class LimitClass(str, enum.Enum):
    """Класс лимита. Связывает authority с правилом limit_rule (exception_kind)."""
    general = "general"
    finance = "finance"
    procurement = "procurement"
    infrastructure = "infrastructure"


class ScopeType(str, enum.Enum):
    metablock = "metablock"
    block = "block"
    department = "department"


class RegionTier(str, enum.Enum):
    tier1 = "tier1"  # Москва + крупные регионы
    tier2 = "tier2"  # остальные


class ScopeClass(str, enum.Enum):
    """Класс скоупа для матча лимитов: КЦ или региональный tier."""
    kc = "kc"
    region_tier1 = "region_tier1"
    region_tier2 = "region_tier2"


class GrantDerivation(str, enum.Enum):
    """Происхождение авторской ячейки матрицы (для аудита)."""
    base_rule = "base_rule"
    cascade = "cascade"
    manual_exception = "manual_exception"


class ResolvedDerivation(str, enum.Enum):
    """Происхождение материализованной строки resolved_grant."""
    base_rule = "base_rule"
    cascade = "cascade"
    universal = "universal"
    sub_delegation = "sub_delegation"
    manual_exception = "manual_exception"


class RequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LevelSource(str, enum.Enum):
    """Источник уровня сотрудника (гибрид: ручной ввод → позже деривация/HR)."""
    manual = "manual"
    derived = "derived"
    hr = "hr"


class CertificateType(str, enum.Enum):
    paper = "paper"        # бумажная
    notarial = "notarial"  # нотариальная
    mchd = "mchd"          # машиночитаемая доверенность


class CertificateStatus(str, enum.Enum):
    active = "active"
    revoked = "revoked"
    expired = "expired"


class IssueMethod(str, enum.Enum):
    in_person = "in_person"  # лично
    ring_mail = "ring_mail"  # кольцевая почта
    postal = "postal"        # Почта России


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    generate = "generate"  # регенерация resolved_grant
    approve = "approve"
    reject = "reject"


def _enum(py_enum, name):
    """Именованный enum-тип с дефолтными настройками проекта."""
    return Enum(py_enum, name=name)


# ─── Association tables ───────────────────────────────────────────────────────

# Перечень полномочий доверенности — FK-ссылки на каталог, НЕ текст.
# Даёт срез «кто имеет полномочие X сейчас» и авто-инвалидацию при отзыве.
poa_certificate_authorities = Table(
    "poa_certificate_authorities",
    Base.metadata,
    Column(
        "certificate_id",
        Integer,
        ForeignKey("poa_certificates.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "authority_id",
        Integer,
        ForeignKey("poa_authorities.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


# ─── Модуль 1: База полномочий ────────────────────────────────────────────────

class AuthorityCategory(Base):
    """Дерево категорий полномочий (H1–H5 в матрице), self-ref."""
    __tablename__ = "poa_authority_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(
        Integer, ForeignKey("poa_authority_categories.id", ondelete="RESTRICT"), nullable=True
    )
    level = Column(Integer, nullable=False)  # 1..5
    name = Column(String(500), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0, server_default="0")

    parent = relationship("AuthorityCategory", remote_side=[id], backref="children")
    authorities = relationship("Authority", back_populates="category")


class Authority(Base):
    """Каталог полномочий: дедуплицированная формулировка, по одному разу."""
    __tablename__ = "poa_authorities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False, unique=True)  # напр. POA-DEAL-013
    category_id = Column(
        Integer, ForeignKey("poa_authority_categories.id", ondelete="RESTRICT"), nullable=False
    )
    name_short = Column(String(500), nullable=False)  # лейбл для UI
    text_full = Column(Text, nullable=False)          # формулировка для тела доверенности
    authority_kind = Column(_enum(AuthorityKind, "poa_authority_kind"), nullable=False)
    deal_direction = Column(
        _enum(DealDirection, "poa_deal_direction"),
        nullable=False,
        default=DealDirection.na,
        server_default=DealDirection.na.value,
    )
    # Класс лимита — ключ матча с limit_rule.exception_kind (только для expense).
    limit_class = Column(_enum(LimitClass, "poa_limit_class"), nullable=True)
    is_universal = Column(Boolean, nullable=False, default=False, server_default="false")
    limit_applies = Column(Boolean, nullable=False, default=False, server_default="false")
    is_no_limit = Column(Boolean, nullable=False, default=False, server_default="false")
    legal_basis = Column(Text, nullable=True)
    status = Column(
        _enum(AuthorityStatus, "poa_authority_status"),
        nullable=False,
        default=AuthorityStatus.draft,
        server_default=AuthorityStatus.draft.value,
    )
    version = Column(Integer, nullable=False, default=1, server_default="1")
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    updated_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    category = relationship("AuthorityCategory", back_populates="authorities")
    grants = relationship(
        "AuthorityGrant", back_populates="authority", cascade="all, delete-orphan"
    )


class OrgScope(Base):
    """Организационная привязка (метаблок → блок → департамент). Компания — атрибут."""
    __tablename__ = "poa_org_scopes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(
        Integer, ForeignKey("poa_org_scopes.id", ondelete="RESTRICT"), nullable=True
    )
    scope_type = Column(_enum(ScopeType, "poa_scope_type"), nullable=False)
    name = Column(String(500), nullable=False)
    company = Column(String(100), nullable=False)  # МГТС / ДЗО-N — решение №3
    is_corporate_center = Column(Boolean, nullable=False, default=False, server_default="false")
    region_tier = Column(_enum(RegionTier, "poa_region_tier"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    parent = relationship("OrgScope", remote_side=[id], backref="children")


class OrgLevel(Base):
    """Уровни полномочий CEO-1..CEO-5."""
    __tablename__ = "poa_org_levels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(20), nullable=False, unique=True)  # CEO-1..CEO-5
    rank = Column(Integer, nullable=False, unique=True)     # 1..5
    # false для CEO-4/-5 — сделки только через передоверие
    can_conclude_deals_default = Column(
        Boolean, nullable=False, default=True, server_default="true"
    )


class AuthorityGrant(Base):
    """Матрица выдачи (авторские правила): ячейка = полномочие × скоуп × уровень."""
    __tablename__ = "poa_authority_grants"
    __table_args__ = (
        UniqueConstraint(
            "authority_id", "org_scope_id", "org_level_id", name="uq_poa_grant_cell"
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    authority_id = Column(
        Integer, ForeignKey("poa_authorities.id", ondelete="CASCADE"), nullable=False
    )
    # null = универсальное / все скоупы
    org_scope_id = Column(
        Integer, ForeignKey("poa_org_scopes.id", ondelete="CASCADE"), nullable=True
    )
    org_level_id = Column(
        Integer, ForeignKey("poa_org_levels.id", ondelete="CASCADE"), nullable=False
    )
    granted = Column(Boolean, nullable=False, default=True, server_default="true")
    # Обычно null (лимит из общего блока limit_rule); заполняется как исключение.
    limit_override = Column(Numeric(18, 2), nullable=True)
    no_limit = Column(Boolean, nullable=False, default=False, server_default="false")  # зелёное
    sub_delegation_only = Column(Boolean, nullable=False, default=False, server_default="false")
    derivation = Column(
        _enum(GrantDerivation, "poa_grant_derivation"),
        nullable=False,
        default=GrantDerivation.base_rule,
        server_default=GrantDerivation.base_rule.value,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    authority = relationship("Authority", back_populates="grants")
    org_scope = relationship("OrgScope")
    org_level = relationship("OrgLevel")


class LimitRule(Base):
    """Финансовые лимиты отдельным блоком (Матрица 2.0: правило формулируется 1 раз)."""
    __tablename__ = "poa_limit_rules"
    __table_args__ = (
        UniqueConstraint(
            "scope_class", "org_level_id", "exception_kind", "deal_direction",
            name="uq_poa_limit_rule",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    scope_class = Column(_enum(ScopeClass, "poa_scope_class"), nullable=False)
    org_level_id = Column(
        Integer, ForeignKey("poa_org_levels.id", ondelete="CASCADE"), nullable=False
    )
    exception_kind = Column(_enum(LimitClass, "poa_limit_class"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="RUB", server_default="RUB")
    # Лимиты применяются только к расходным сделкам.
    deal_direction = Column(
        _enum(DealDirection, "poa_deal_direction"),
        nullable=False,
        default=DealDirection.expense,
        server_default=DealDirection.expense.value,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    org_level = relationship("OrgLevel")


class Employee(Base):
    """Сотрудники (для автовыдачи «по уровню» и связи с заявками/реестром)."""
    __tablename__ = "poa_employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fio = Column(String(500), nullable=False)
    position = Column(String(500), nullable=True)
    company = Column(String(100), nullable=False)  # МГТС / ДЗО-N
    org_scope_id = Column(
        Integer, ForeignKey("poa_org_scopes.id", ondelete="SET NULL"), nullable=True
    )
    # Гибрид: уровень может быть не задан, пока не введён вручную / не выведен из HR.
    org_level_id = Column(
        Integer, ForeignKey("poa_org_levels.id", ondelete="SET NULL"), nullable=True
    )
    level_source = Column(
        _enum(LevelSource, "poa_level_source"),
        nullable=False,
        default=LevelSource.manual,
        server_default=LevelSource.manual.value,
    )
    tab_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    org_scope = relationship("OrgScope")
    org_level = relationship("OrgLevel")


class PositionLevelRule(Base):
    """Правила деривации CEO-N из должности (заготовка под будущий HR-фид).

    В фазе 1 не используется логикой — только схема; уровень вводится вручную.
    """
    __tablename__ = "poa_position_level_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    position_pattern = Column(String(500), nullable=False)
    org_level_id = Column(
        Integer, ForeignKey("poa_org_levels.id", ondelete="CASCADE"), nullable=False
    )
    priority = Column(Integer, nullable=False, default=0, server_default="0")

    org_level = relationship("OrgLevel")


class AuthorityRequest(Base):
    """Заявка на уникальное полномочие сверх дефолта по уровню."""
    __tablename__ = "poa_authority_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(
        Integer, ForeignKey("poa_employees.id", ondelete="CASCADE"), nullable=False
    )
    # Либо ссылка на каталог...
    authority_id = Column(
        Integer, ForeignKey("poa_authorities.id", ondelete="SET NULL"), nullable=True
    )
    # ...либо предложение нового полномочия (free-text).
    proposed_text = Column(Text, nullable=True)
    justification = Column(Text, nullable=True)
    status = Column(
        _enum(RequestStatus, "poa_request_status"),
        nullable=False,
        default=RequestStatus.pending,
        server_default=RequestStatus.pending.value,
    )
    approver = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    employee = relationship("Employee")
    authority = relationship("Authority")


class ResolvedGrant(Base):
    """Материализация: плоские аудируемые строки, сгенерированные из авторских правил.

    Регенерируется целиком движком резолвинга при изменении авторских данных.
    """
    __tablename__ = "poa_resolved_grants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_scope_id = Column(
        Integer, ForeignKey("poa_org_scopes.id", ondelete="CASCADE"), nullable=True
    )
    org_level_id = Column(
        Integer, ForeignKey("poa_org_levels.id", ondelete="CASCADE"), nullable=False
    )
    authority_id = Column(
        Integer, ForeignKey("poa_authorities.id", ondelete="CASCADE"), nullable=False
    )
    granted = Column(Boolean, nullable=False, default=True, server_default="true")
    effective_limit = Column(Numeric(18, 2), nullable=True)
    no_limit = Column(Boolean, nullable=False, default=False, server_default="false")
    unlimited = Column(Boolean, nullable=False, default=False, server_default="false")
    currency = Column(String(3), nullable=True)
    derivation = Column(_enum(ResolvedDerivation, "poa_resolved_derivation"), nullable=False)
    source_grant_id = Column(
        Integer, ForeignKey("poa_authority_grants.id", ondelete="SET NULL"), nullable=True
    )
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    authority = relationship("Authority")
    org_scope = relationship("OrgScope")
    org_level = relationship("OrgLevel")


# ─── Модуль 2: Реестр выданных доверенностей ──────────────────────────────────

class PoaCertificate(Base):
    """Запись реестра. Заменяет электронный реестр Service Desk + бумажный журнал."""
    __tablename__ = "poa_certificates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    number = Column(String(100), nullable=False, unique=True)
    grantor_company = Column(String(200), nullable=False)  # доверитель
    # Поверенный: FK на employee + денормализованный снимок на момент выдачи.
    grantee_employee_id = Column(
        Integer, ForeignKey("poa_employees.id", ondelete="SET NULL"), nullable=True
    )
    grantee_fio = Column(String(500), nullable=False)
    grantee_position = Column(String(500), nullable=True)
    grantee_tab_number = Column(String(50), nullable=True)
    cert_type = Column(_enum(CertificateType, "poa_certificate_type"), nullable=False)
    issued_date = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=True)
    limits = Column(JSONB, nullable=True)  # снимок лимитов на момент выдачи
    signer = Column(String(500), nullable=True)          # подписант
    registration_data = Column(String(500), nullable=True)
    scan_path = Column(String(1000), nullable=True)      # скан
    # Основание: заявка на полномочие или процесс оформления (Модуль 6, позже).
    basis_request_id = Column(
        Integer, ForeignKey("poa_authority_requests.id", ondelete="SET NULL"), nullable=True
    )
    status = Column(
        _enum(CertificateStatus, "poa_certificate_status"),
        nullable=False,
        default=CertificateStatus.active,
        server_default=CertificateStatus.active.value,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    grantee_employee = relationship("Employee")
    basis_request = relationship("AuthorityRequest")
    authorities = relationship("Authority", secondary=poa_certificate_authorities)
    original_issues = relationship(
        "PoaOriginalIssue", back_populates="certificate", cascade="all, delete-orphan"
    )


class PoaOriginalIssue(Base):
    """Под-запись «выдача оригинала» — заменяет бумажный журнал (физическая выдача)."""
    __tablename__ = "poa_original_issues"

    id = Column(Integer, primary_key=True, autoincrement=True)
    certificate_id = Column(
        Integer, ForeignKey("poa_certificates.id", ondelete="CASCADE"), nullable=False
    )
    recipient_fio = Column(String(500), nullable=False)  # получатель (расшифровка)
    issued_date = Column(Date, nullable=False)
    method = Column(_enum(IssueMethod, "poa_issue_method"), nullable=False)
    confirmed = Column(Boolean, nullable=False, default=False, server_default="false")
    confirmation_note = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    certificate = relationship("PoaCertificate", back_populates="original_issues")


# ─── Аудит (юридически значимый артефакт) ─────────────────────────────────────

class PoaAudit(Base):
    """История изменений матрицы/каталога/лимитов/заявок: кто/когда/что."""
    __tablename__ = "poa_audit"

    id = Column(Integer, primary_key=True, autoincrement=True)
    # authority | authority_grant | limit_rule | authority_request | ...
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    action = Column(_enum(AuditAction, "poa_audit_action"), nullable=False)
    diff = Column(JSONB, nullable=True)  # {"before": {...}, "after": {...}}
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
