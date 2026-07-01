"""Модуль «Доверенности» — Pydantic-схемы.

M1: фундамент Модуля 1 (каталог полномочий + деревья + лимиты). Стиль повторяет
app/schemas/processes.py: _OrmBase (from_attributes), раздельные Create/Update/Response,
enum-типы импортируются из моделей.

Матрица выдачи (AuthorityGrant), резолвинг и реестр — вне M1 (см. M2/M3).
"""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.poa import (
    AuthorityKind,
    AuthorityStatus,
    DealDirection,
    LimitClass,
    RegionTier,
    ScopeClass,
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
    limit_class: LimitClass | None = None
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
    limit_class: LimitClass | None = None
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
    limit_class: LimitClass | None
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
    is_corporate_center: bool = False
    region_tier: RegionTier | None = None


class OrgScopeUpdate(BaseModel):
    parent_id: int | None = None
    scope_type: ScopeType | None = None
    name: str | None = None
    company: str | None = None
    is_corporate_center: bool | None = None
    region_tier: RegionTier | None = None


class OrgScopeResponse(_OrmBase):
    id: int
    parent_id: int | None
    scope_type: ScopeType
    name: str
    company: str
    is_corporate_center: bool
    region_tier: RegionTier | None
    created_at: datetime


# ─── OrgLevel (CEO-1..5) ──────────────────────────────────────────────────────


class OrgLevelCreate(BaseModel):
    code: str
    rank: int = Field(ge=1)
    can_conclude_deals_default: bool = True


class OrgLevelUpdate(BaseModel):
    code: str | None = None
    rank: int | None = Field(default=None, ge=1)
    can_conclude_deals_default: bool | None = None


class OrgLevelResponse(_OrmBase):
    id: int
    code: str
    rank: int
    can_conclude_deals_default: bool


# ─── LimitRule (блок финансовых лимитов) ──────────────────────────────────────


class LimitRuleCreate(BaseModel):
    scope_class: ScopeClass
    org_level_id: int
    exception_kind: LimitClass
    amount: Decimal
    currency: str = "RUB"
    deal_direction: DealDirection = DealDirection.expense


class LimitRuleUpdate(BaseModel):
    scope_class: ScopeClass | None = None
    org_level_id: int | None = None
    exception_kind: LimitClass | None = None
    amount: Decimal | None = None
    currency: str | None = None
    deal_direction: DealDirection | None = None


class LimitRuleResponse(_OrmBase):
    id: int
    scope_class: ScopeClass
    org_level_id: int
    exception_kind: LimitClass
    amount: Decimal
    currency: str
    deal_direction: DealDirection
    created_at: datetime
    updated_at: datetime
