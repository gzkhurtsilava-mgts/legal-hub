"""Модуль «Доверенности» — Pydantic-схемы.

M1: фундамент Модуля 1 (каталог полномочий + деревья + лимиты). Стиль повторяет
app/schemas/processes.py: _OrmBase (from_attributes), раздельные Create/Update/Response,
enum-типы импортируются из моделей.

Матрица выдачи (AuthorityGrant), резолвинг и реестр — вне M1 (см. M2/M3).
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.poa import (
    AuthorityKind,
    AuthorityStatus,
    CertificateStatus,
    CertificateType,
    DealDirection,
    GrantDerivation,
    IssueMethod,
    LevelSource,
    OrgSource,
    RequestStatus,
    ResolvedDerivation,
    ScopeType,
)


class _OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── AuthorityCategory (дерево H1–H5) ─────────────────────────────────────────


class AuthorityCategoryCreate(BaseModel):
    parent_id: int | None = None
    level: int = Field(ge=1, le=5)
    name: str
    sort_order: int = 0


class AuthorityCategoryUpdate(BaseModel):
    parent_id: int | None = None
    level: int | None = Field(default=None, ge=1, le=5)
    name: str | None = None
    sort_order: int | None = None


class AuthorityCategoryResponse(_OrmBase):
    id: int
    parent_id: int | None
    level: int
    name: str
    sort_order: int


# ─── Authority (каталог полномочий) ───────────────────────────────────────────


class AuthorityCreate(BaseModel):
    code: str
    category_id: int
    name_short: str
    text_full: str
    authority_kind: AuthorityKind
    deal_direction: DealDirection = DealDirection.na
    is_universal: bool = False
    limit_applies: bool = False
    is_no_limit: bool = False
    legal_basis: str | None = None
    status: AuthorityStatus = AuthorityStatus.draft
    version: int = 1
    valid_from: date | None = None
    valid_to: date | None = None


class AuthorityUpdate(BaseModel):
    code: str | None = None
    category_id: int | None = None
    name_short: str | None = None
    text_full: str | None = None
    authority_kind: AuthorityKind | None = None
    deal_direction: DealDirection | None = None
    is_universal: bool | None = None
    limit_applies: bool | None = None
    is_no_limit: bool | None = None
    legal_basis: str | None = None
    status: AuthorityStatus | None = None
    version: int | None = None
    valid_from: date | None = None
    valid_to: date | None = None


class AuthorityResponse(_OrmBase):
    id: int
    code: str
    category_id: int
    name_short: str
    text_full: str
    authority_kind: AuthorityKind
    deal_direction: DealDirection
    is_universal: bool
    limit_applies: bool
    is_no_limit: bool
    legal_basis: str | None
    status: AuthorityStatus
    version: int
    valid_from: date | None
    valid_to: date | None
    updated_by: str | None
    created_at: datetime
    updated_at: datetime


# ─── OrgScope (дерево орг-структуры; компания — атрибут) ──────────────────────


class OrgScopeCreate(BaseModel):
    parent_id: int | None = None
    scope_type: ScopeType
    name: str
    company: str
    source: OrgSource = OrgSource.manual
    external_id: str | None = None


class OrgScopeUpdate(BaseModel):
    parent_id: int | None = None
    scope_type: ScopeType | None = None
    name: str | None = None
    company: str | None = None
    source: OrgSource | None = None
    external_id: str | None = None


class OrgScopeResponse(_OrmBase):
    id: int
    parent_id: int | None
    scope_type: ScopeType
    name: str
    company: str
    source: OrgSource
    external_id: str | None
    created_at: datetime


# ─── OrgLevel (CEO-1 / CEO-2 и ниже) ──────────────────────────────────────────


class OrgLevelCreate(BaseModel):
    code: str
    rank: int = Field(ge=1)


class OrgLevelUpdate(BaseModel):
    code: str | None = None
    rank: int | None = Field(default=None, ge=1)


class OrgLevelResponse(_OrmBase):
    id: int
    code: str
    rank: int


# ─── LimitRule (блок финансовых лимитов) ──────────────────────────────────────


class LimitRuleCreate(BaseModel):
    org_level_id: int
    amount: Decimal
    currency: str = "RUB"


class LimitRuleUpdate(BaseModel):
    org_level_id: int | None = None
    amount: Decimal | None = None
    currency: str | None = None


class LimitRuleResponse(_OrmBase):
    id: int
    org_level_id: int
    amount: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime


# ─── Matrix: авторские ячейки (AuthorityGrant) ────────────────────────────────


class MatrixCellUpsert(BaseModel):
    """Upsert ячейки доступности. org_scope_id=None — «во всех скоупах»."""
    authority_id: int
    org_scope_id: int | None = None
    granted: bool = True


class AuthorityGrantResponse(_OrmBase):
    id: int
    authority_id: int
    org_scope_id: int | None
    granted: bool
    derivation: GrantDerivation
    created_at: datetime
    updated_at: datetime


class RegenerateResponse(BaseModel):
    resolved_count: int


# ─── Resolved grants (материализация) ─────────────────────────────────────────


class ResolvedGrantResponse(_OrmBase):
    id: int
    org_scope_id: int | None
    org_level_id: int
    authority_id: int
    granted: bool
    effective_limit: Decimal | None
    no_limit: bool
    unlimited: bool
    currency: str | None
    derivation: ResolvedDerivation
    source_grant_id: int | None
    generated_at: datetime


# ─── Employees ────────────────────────────────────────────────────────────────


class EmployeeCreate(BaseModel):
    fio: str
    position: str | None = None
    company: str
    org_scope_id: int | None = None
    org_level_id: int | None = None
    level_source: LevelSource = LevelSource.manual
    tab_number: str | None = None


class EmployeeUpdate(BaseModel):
    fio: str | None = None
    position: str | None = None
    company: str | None = None
    org_scope_id: int | None = None
    org_level_id: int | None = None
    level_source: LevelSource | None = None
    tab_number: str | None = None


class EmployeeResponse(_OrmBase):
    id: int
    fio: str
    position: str | None
    company: str
    org_scope_id: int | None
    org_level_id: int | None
    level_source: LevelSource
    tab_number: str | None
    created_at: datetime
    updated_at: datetime


# ─── Resolve (эффективные полномочия сотрудника) ──────────────────────────────


class ResolvedAuthorityOut(BaseModel):
    authority_id: int | None
    code: str | None
    name_short: str | None
    granted: bool
    effective_limit: Decimal | None
    no_limit: bool
    unlimited: bool
    currency: str | None
    derivation: ResolvedDerivation
    proposed_text: str | None = None


class ResolveResponse(BaseModel):
    employee_id: int
    org_scope_id: int | None
    org_level_id: int | None
    authorities: list[ResolvedAuthorityOut]


# ─── Authority requests (заявки на полномочие сверх дефолта) ──────────────────


class AuthorityRequestCreate(BaseModel):
    employee_id: int
    authority_id: int | None = None
    proposed_text: str | None = None
    justification: str | None = None


class AuthorityRequestResponse(_OrmBase):
    id: int
    employee_id: int
    authority_id: int | None
    proposed_text: str | None
    justification: str | None
    status: RequestStatus
    approver: str | None
    created_at: datetime
    updated_at: datetime


# ─── Registry: выданные доверенности (Модуль 2) ───────────────────────────────


class AuthorityRef(_OrmBase):
    """Лёгкая ссылка на полномочие в перечне доверенности."""
    id: int
    code: str
    name_short: str


class OriginalIssueCreate(BaseModel):
    """Выдача оригинала — заменяет бумажный журнал (физическая выдача)."""
    recipient_fio: str
    issued_date: date
    method: IssueMethod
    confirmed: bool = False
    confirmation_note: str | None = None


class OriginalIssueResponse(_OrmBase):
    id: int
    certificate_id: int
    recipient_fio: str
    issued_date: date
    method: IssueMethod
    confirmed: bool
    confirmation_note: str | None
    created_at: datetime


class CertificateCreate(BaseModel):
    number: str
    grantor_company: str
    grantee_employee_id: int | None = None
    grantee_fio: str
    grantee_position: str | None = None
    grantee_tab_number: str | None = None
    cert_type: CertificateType
    issued_date: date
    valid_to: date | None = None
    limits: dict[str, Any] | None = None
    signer: str | None = None
    registration_data: str | None = None
    scan_path: str | None = None
    basis_request_id: int | None = None
    authority_ids: list[int] = []


class CertificateUpdate(BaseModel):
    grantor_company: str | None = None
    grantee_employee_id: int | None = None
    grantee_fio: str | None = None
    grantee_position: str | None = None
    grantee_tab_number: str | None = None
    cert_type: CertificateType | None = None
    issued_date: date | None = None
    valid_to: date | None = None
    limits: dict[str, Any] | None = None
    signer: str | None = None
    registration_data: str | None = None
    scan_path: str | None = None
    authority_ids: list[int] | None = None


# ─── Navigator (навигатор заявок, Модуль 4) ──────────────────────────────────


class NavigatorAnswers(BaseModel):
    q1: str | None = None
    q2: str | None = None
    q3: str | None = None
    q4: str | None = None
    q5: str | None = None


class NavigatorQuestion(BaseModel):
    id: str
    title: str
    options: list[str]


class NavigatorStepResponse(BaseModel):
    status: Literal["question", "result"]
    answered: int
    total: int
    question: NavigatorQuestion | None
    result: str | None
    url: str | None


class RenderRequest(BaseModel):
    """Запрос генерации доверенности из шаблона (конструктор, Модуль 3)."""
    grantee_fio: str
    grantee_passport: str = ""
    validity: str = ""
    authority_ids: list[int] = []
    template: str = "mgts_default"
    output: Literal["docx", "pdf"] = "docx"


class CertificateResponse(_OrmBase):
    id: int
    number: str
    grantor_company: str
    grantee_employee_id: int | None
    grantee_fio: str
    grantee_position: str | None
    grantee_tab_number: str | None
    cert_type: CertificateType
    issued_date: date
    valid_to: date | None
    limits: dict[str, Any] | None
    signer: str | None
    registration_data: str | None
    scan_path: str | None
    basis_request_id: int | None
    status: CertificateStatus
    authorities: list[AuthorityRef]
    created_at: datetime
    updated_at: datetime
