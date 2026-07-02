"""M2: тесты движка резолвинга.

Две оси: подразделение (наследование по дереву) → полномочия, уровень → лимит.
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
    AuthorityStatus,
    DealDirection,
    Employee,
    LimitRule,
    OrgLevel,
    OrgScope,
    RequestStatus,
    ResolvedDerivation,
    ResolvedGrant,
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


async def _level(db, code, rank):
    return await _flush(db, OrgLevel(code=code, rank=rank))


async def _scope(db, name, company="МГТС", parent_id=None, stype="metablock"):
    return await _flush(
        db, OrgScope(scope_type=stype, name=name, company=company, parent_id=parent_id)
    )


async def _authority(db, cat_id, code, *, kind=AuthorityKind.deal,
                     direction=DealDirection.expense, limit_applies=True,
                     universal=False, no_limit=False):
    return await _flush(
        db,
        Authority(
            code=code, category_id=cat_id, name_short=code, text_full="текст",
            authority_kind=kind, deal_direction=direction, limit_applies=limit_applies,
            is_universal=universal, is_no_limit=no_limit, status=AuthorityStatus.active,
        ),
    )


async def _grant(db, auth_id, *, scope_id=None, granted=True):
    return await _flush(
        db,
        AuthorityGrant(authority_id=auth_id, org_scope_id=scope_id, granted=granted),
    )


async def _limit(db, level_id, amount):
    return await _flush(db, LimitRule(org_level_id=level_id, amount=Decimal(amount)))


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


async def test_universal_applies_to_all(db_session):
    db = db_session
    cat = await _category(db)
    l1 = await _level(db, "CEO-1", 1)
    await _level(db, "CEO-2-", 2)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-U", universal=True, limit_applies=False)

    n = await regenerate_resolved_grants(db)
    assert n == 2  # 1 полномочие × 1 скоуп × 2 уровня
    r = await _resolved(db, sc.id, l1.id, a.id)
    assert r is not None and r.derivation == ResolvedDerivation.universal
    assert r.unlimited is True


async def test_tree_inheritance(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    bpo = await _scope(db, "БПО", stype="block")
    court = await _scope(db, "Отдел судебной работы", parent_id=bpo.id, stype="division")
    shared = await _authority(db, cat.id, "POA-BPO", limit_applies=False)
    court_only = await _authority(db, cat.id, "POA-COURT", limit_applies=False)
    await _grant(db, shared.id, scope_id=bpo.id)       # на родителе
    await _grant(db, court_only.id, scope_id=court.id)  # на дочернем узле

    await regenerate_resolved_grants(db)
    # полномочие БПО наследуется вниз в отдел (cascade), на самом БПО — base_rule
    assert (await _resolved(db, bpo.id, lvl.id, shared.id)).derivation == \
        ResolvedDerivation.base_rule
    assert (await _resolved(db, court.id, lvl.id, shared.id)).derivation == \
        ResolvedDerivation.cascade
    # полномочие отдела виден только в отделе, не в БПО
    assert await _resolved(db, court.id, lvl.id, court_only.id) is not None
    assert await _resolved(db, bpo.id, lvl.id, court_only.id) is None


async def test_income_is_unlimited(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-INC", direction=DealDirection.income)
    await _limit(db, lvl.id, "1000000")
    await _grant(db, a.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    r = await _resolved(db, sc.id, lvl.id, a.id)
    assert r.unlimited is True and r.effective_limit is None


async def test_no_limit_green(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-NL", no_limit=True)
    await _grant(db, a.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    r = await _resolved(db, sc.id, lvl.id, a.id)
    assert r.no_limit is True and r.unlimited is False and r.effective_limit is None


async def test_limit_by_level(db_session):
    db = db_session
    cat = await _category(db)
    l1 = await _level(db, "CEO-1", 1)
    l2 = await _level(db, "CEO-2-", 2)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-LIM")
    await _limit(db, l1.id, "1000000")   # CEO-1
    await _limit(db, l2.id, "300000")    # CEO-2 и ниже
    await _grant(db, a.id, scope_id=sc.id)

    await regenerate_resolved_grants(db)
    assert (await _resolved(db, sc.id, l1.id, a.id)).effective_limit == Decimal("1000000")
    assert (await _resolved(db, sc.id, l2.id, a.id)).effective_limit == Decimal("300000")


async def test_null_scope_applies_everywhere(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    s1 = await _scope(db, "БПО", stype="block")
    s2 = await _scope(db, "IT", stype="block")
    a = await _authority(db, cat.id, "POA-ALL", universal=False, limit_applies=False)
    await _grant(db, a.id, scope_id=None)  # во всех скоупах

    await regenerate_resolved_grants(db)
    assert await _resolved(db, s1.id, lvl.id, a.id) is not None
    assert await _resolved(db, s2.id, lvl.id, a.id) is not None


async def test_explicit_denial_removes_cell(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-DENY", universal=True, limit_applies=False)
    # универсальное, но явный запрет на конкретном узле
    await _grant(db, a.id, scope_id=sc.id, granted=False)

    await regenerate_resolved_grants(db)
    assert await _resolved(db, sc.id, lvl.id, a.id) is None


async def test_resolve_employee(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-2-", 2)
    sc = await _scope(db, "КЦ")
    a = await _authority(db, cat.id, "POA-E", limit_applies=False)
    await _grant(db, a.id, scope_id=sc.id)
    await regenerate_resolved_grants(db)
    emp = await _flush(db, Employee(fio="Иванов", company="МГТС",
                                    org_scope_id=sc.id, org_level_id=lvl.id))

    items = await resolve_employee(db, emp)
    assert [i.code for i in items] == ["POA-E"]

    # без уровня/подразделения — пусто
    emp2 = await _flush(db, Employee(fio="Петров", company="МГТС"))
    assert await resolve_employee(db, emp2) == []


async def test_resolve_manual_exception(db_session):
    db = db_session
    cat = await _category(db)
    lvl = await _level(db, "CEO-1", 1)
    sc = await _scope(db, "КЦ")
    granted_a = await _authority(db, cat.id, "POA-BASE", limit_applies=False)
    extra_a = await _authority(db, cat.id, "POA-EXTRA", limit_applies=False)
    await _grant(db, granted_a.id, scope_id=sc.id)
    await regenerate_resolved_grants(db)
    emp = await _flush(db, Employee(fio="Сидоров", company="МГТС",
                                    org_scope_id=sc.id, org_level_id=lvl.id))
    await _flush(db, AuthorityRequest(employee_id=emp.id, authority_id=extra_a.id,
                                      status=RequestStatus.approved))

    items = await resolve_employee(db, emp)
    by_code = {i.code: i for i in items}
    assert set(by_code) == {"POA-BASE", "POA-EXTRA"}
    assert by_code["POA-EXTRA"].derivation == ResolvedDerivation.manual_exception
