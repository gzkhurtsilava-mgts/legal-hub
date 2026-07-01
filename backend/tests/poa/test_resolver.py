"""M2: тесты движка резолвинга — по одному на каждое правило PRD 3.2.

Работают напрямую с сервисным слоем (regenerate/resolve) через db_session.
Требуют PostgreSQL (см. conftest).
"""

from decimal import Decimal

import pytest
from sqlalchemy import select

from app.models.poa import (
    Authority,
    AuthorityCategory,
    AuthorityGrant,
    AuthorityKind,
    AuthorityRequest,
    DealDirection,
    Employee,
    LimitClass,
    LimitRule,
    OrgLevel,
    OrgScope,
    RegionTier,
    RequestStatus,
    ResolvedDerivation,
    ResolvedGrant,
    ScopeClass,
)
from app.services.poa.resolver import regenerate_resolved_grants, resolve_employee

pytestmark = pytest.mark.asyncio


# ─── helpers ──────────────────────────────────────────────────────────────────


async def _flush(db, obj):
    db.add(obj)
    await db.flush()
    return obj


async def _category(db):
    return await _flush(db, AuthorityCategory(level=1, name="Категория"))


async def _level(db, code, rank, deals=True):
    return await _flush(db, OrgLevel(code=code, rank=rank, can_conclude_deals_default=deals))


async def _scope(db, name, company="МГТС", kc=False, tier=None, stype="metablock"):
    return await _flush(
        db,
        OrgScope(scope_type=stype, name=name, company=company,
                 is_corporate_center=kc, region_tier=tier),
    )


async def _authority(db, cat_id, code, *, kind=AuthorityKind.deal,
                     direction=DealDirection.expense, limit_applies=True,
                     limit_class=LimitClass.general, universal=False, no_limit=False):
    from app.models.poa import AuthorityStatus
    return await _flush(
        db,
        Authority(
            code=code, category_id=cat_id, name_short=code, text_full="текст",
            authority_kind=kind, deal_direction=direction, limit_applies=limit_applies,
            limit_class=limit_class, is_universal=universal, is_no_limit=no_limit,
            status=AuthorityStatus.active,
        ),
    )


async def _grant(db, auth_id, level_id, *, scope_id=None, granted=True,
                 override=None, no_limit=False, sub_only=False):
    return await _flush(
        db,
        AuthorityGrant(
            authority_id=auth_id, org_scope_id=scope_id, org_level_id=level_id,
            granted=granted, limit_override=override, no_limit=no_limit,
            sub_delegation_only=sub_only,
        ),
    )


async def _limit(db, scope_class, level_id, amount, kind=LimitClass.general):
    return await _flush(
        db,
        LimitRule(scope_class=scope_class, org_level_id=level_id, exception_kind=kind,
                  amount=Decimal(amount), deal_direction=DealDirection.expense),
    )


async def _resolved(db, scope_id, level_id, auth_id) -> ResolvedGrant | None:
    return (
        await db.execute(
            select(ResolvedGrant).where(
                ResolvedGrant.org_scope_id == scope_id,
                ResolvedGrant.org_level_id == level_id,
                ResolvedGrant.authority_id == auth_id,
            )
        )
    ).scalar_one_or_none()


# ─── правила ──────────────────────────────────────────────────────────────────


async def test_universal_cascades_to_all(db_session):
    db = db_session
    cat = await _category(db)
    l1 = await _level(db, "CEO-1", 1)
    await _level(db, "CEO-2", 2)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-U", universal=True, limit_applies=False)

    n = await regenerate_resolved_grants(db)
    assert n == 2  # 1 authority × 1 scope × 2 levels
    r = await _resolved(db, sc.id, l1.id, a.id)
    assert r is not None and r.derivation == ResolvedDerivation.universal
    assert r.unlimited is True


async def test_base_and_cascade_upward(db_session):
    db = db_session
    cat = await _category(db)
    l1 = await _level(db, "CEO-1", 1)
    l2 = await _level(db, "CEO-2", 2)
    l3 = await _level(db, "CEO-3", 3)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-D", limit_applies=False)
    await _grant(db, a.id, l3.id, scope_id=sc.id)  # выдано на CEO-3

    await regenerate_resolved_grants(db)
    assert (await _resolved(db, sc.id, l3.id, a.id)).derivation == ResolvedDerivation.base_rule
    assert (await _resolved(db, sc.id, l2.id, a.id)).derivation == ResolvedDerivation.cascade
    assert (await _resolved(db, sc.id, l1.id, a.id)).derivation == ResolvedDerivation.cascade
    # ниже по иерархии полномочие не появляется — CEO-3 самый нижний здесь


async def test_income_is_unlimited(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-INC", direction=DealDirection.income)
    await _limit(db, ScopeClass.kc, lvl.id, "1000000")
    await _grant(db, a.id, lvl.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    r = await _resolved(db, sc.id, lvl.id, a.id)
    assert r.unlimited is True and r.effective_limit is None


async def test_no_limit_green(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-NL", no_limit=True)
    await _grant(db, a.id, lvl.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    r = await _resolved(db, sc.id, lvl.id, a.id)
    assert r.no_limit is True and r.unlimited is False and r.effective_limit is None


async def test_limit_by_tier(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-2", 2)
    kc = await _scope(db, "КЦ", kc=True)
    t1 = await _scope(db, "Москва", tier=RegionTier.tier1)
    t2 = await _scope(db, "Регион", tier=RegionTier.tier2)
    a = await _authority(db, cat.id, "POA-LIM")
    await _limit(db, ScopeClass.kc, lvl.id, "1000000")
    await _limit(db, ScopeClass.region_tier1, lvl.id, "500000")
    await _limit(db, ScopeClass.region_tier2, lvl.id, "250000")
    await _grant(db, a.id, lvl.id)  # null scope → все скоупы

    await regenerate_resolved_grants(db)
    assert (await _resolved(db, kc.id, lvl.id, a.id)).effective_limit == Decimal("1000000")
    assert (await _resolved(db, t1.id, lvl.id, a.id)).effective_limit == Decimal("500000")
    assert (await _resolved(db, t2.id, lvl.id, a.id)).effective_limit == Decimal("250000")


async def test_override_wins(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-OVR")
    await _limit(db, ScopeClass.kc, lvl.id, "1000000")
    await _grant(db, a.id, lvl.id, scope_id=sc.id, override=Decimal("777"))

    await regenerate_resolved_grants(db)
    assert (await _resolved(db, sc.id, lvl.id, a.id)).effective_limit == Decimal("777.00")


async def test_sub_delegation_coeff(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-2", 2)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-SUB")
    await _limit(db, ScopeClass.kc, lvl.id, "1000000")
    await _grant(db, a.id, lvl.id, scope_id=sc.id, sub_only=True)

    await regenerate_resolved_grants(db)
    r = await _resolved(db, sc.id, lvl.id, a.id)
    assert r.derivation == ResolvedDerivation.sub_delegation
    assert r.effective_limit == Decimal("600000.00")  # 1_000_000 × 0.60


async def test_ceo4_deal_is_sub_delegation(db_session):
    db = db_session
    cat = await _category(db)
    l4 = await _level(db, "CEO-4", 4, deals=False)
    sc = await _scope(db, "КЦ", kc=True)
    deal = await _authority(db, cat.id, "POA-DEAL", kind=AuthorityKind.deal)
    repr_ = await _authority(db, cat.id, "POA-REPR", kind=AuthorityKind.representation,
                             limit_applies=False)
    await _limit(db, ScopeClass.kc, l4.id, "1000000")
    await _grant(db, deal.id, l4.id, scope_id=sc.id)
    await _grant(db, repr_.id, l4.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    # сделочное на CEO-4 → передоверие + ×0.60
    rd = await _resolved(db, sc.id, l4.id, deal.id)
    assert rd.derivation == ResolvedDerivation.sub_delegation
    assert rd.effective_limit == Decimal("600000.00")
    # представительское — обычное, не передоверие
    rr = await _resolved(db, sc.id, l4.id, repr_.id)
    assert rr.derivation == ResolvedDerivation.base_rule


async def test_explicit_denial_removes_cell(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-DENY", universal=True, limit_applies=False)
    # универсальное, но явный запрет на конкретной ячейке
    await _grant(db, a.id, lvl.id, scope_id=sc.id, granted=False)

    await regenerate_resolved_grants(db)
    assert await _resolved(db, sc.id, lvl.id, a.id) is None


async def test_resolve_employee(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-2", 2)
    sc = await _scope(db, "КЦ", kc=True)
    a = await _authority(db, cat.id, "POA-E", limit_applies=False)
    await _grant(db, a.id, lvl.id, scope_id=sc.id)
    await regenerate_resolved_grants(db)
    emp = await _flush(db, Employee(fio="Иванов", company="МГТС",
                                    org_scope_id=sc.id, org_level_id=lvl.id))

    items = await resolve_employee(db, emp)
    assert [i.code for i in items] == ["POA-E"]

    # без уровня — пусто
    emp2 = await _flush(db, Employee(fio="Петров", company="МГТС"))
    assert await resolve_employee(db, emp2) == []


async def test_resolve_manual_exception(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-3", 3)
    sc = await _scope(db, "КЦ", kc=True)
    granted_a = await _authority(db, cat.id, "POA-BASE", limit_applies=False)
    extra_a = await _authority(db, cat.id, "POA-EXTRA", limit_applies=False)
    await _grant(db, granted_a.id, lvl.id, scope_id=sc.id)
    await regenerate_resolved_grants(db)
    emp = await _flush(db, Employee(fio="Сидоров", company="МГТС",
                                    org_scope_id=sc.id, org_level_id=lvl.id))
    await _flush(db, AuthorityRequest(employee_id=emp.id, authority_id=extra_a.id,
                                      status=RequestStatus.approved))

    items = await resolve_employee(db, emp)
    by_code = {i.code: i for i in items}
    assert set(by_code) == {"POA-BASE", "POA-EXTRA"}
    assert by_code["POA-EXTRA"].derivation == ResolvedDerivation.manual_exception
