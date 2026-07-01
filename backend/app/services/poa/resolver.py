"""Модуль «Доверенности» — движок резолвинга (M2).

Две части (по плану doverennosti.md):

(A) `regenerate_resolved_grants` — материализация: из компактных авторских правил
    (`authority_grant` + `limit_rule` + флаги `authority`) генерируем плоские
    аудируемые строки `resolved_grant`. Пересчёт целиком (синхронно; при росте — arq).

(B) `resolve_employee` — эффективные полномочия сотрудника = строки `resolved_grant`
    по его scope+level + одобренные `authority_request` (manual_exception).

`compute_limit` — единая точка расчёта лимита с трассируемым `derivation`.
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.poa import (
    Authority,
    AuthorityGrant,
    AuthorityKind,
    AuthorityRequest,
    AuthorityStatus,
    DealDirection,
    Employee,
    LimitRule,
    OrgLevel,
    OrgScope,
    RegionTier,
    RequestStatus,
    ResolvedDerivation,
    ResolvedGrant,
    ScopeClass,
)

# Приоритеты кандидатов на ячейку (specificity): чем конкретнее правило — тем выше.
_P_UNIVERSAL = 1
_P_CASCADE = 2
_P_BASE_ALL_SCOPES = 3
_P_BASE_EXPLICIT = 4


@dataclass
class _Cand:
    """Кандидат на ячейку матрицы во время генерации."""
    priority: int
    derivation: ResolvedDerivation
    source_grant_id: int | None
    no_limit: bool
    limit_override: Decimal | None
    sub_only: bool


@dataclass
class _Limit:
    """Результат compute_limit."""
    granted: bool
    effective_limit: Decimal | None
    no_limit: bool
    unlimited: bool
    currency: str | None


def derive_scope_class(scope: OrgScope) -> ScopeClass | None:
    """КЦ или региональный tier — ключ матча финансовых лимитов."""
    if scope.is_corporate_center:
        return ScopeClass.kc
    if scope.region_tier == RegionTier.tier1:
        return ScopeClass.region_tier1
    if scope.region_tier == RegionTier.tier2:
        return ScopeClass.region_tier2
    return None


def compute_limit(
    authority: Authority,
    scope_class: ScopeClass | None,
    level_id: int,
    *,
    no_limit_cell: bool,
    limit_override: Decimal | None,
    is_sub_delegation: bool,
    lr_index: dict,
) -> _Limit:
    """Расчёт лимита ячейки. Порядок (precedence) — как в плане.

    income/limit_applies=false → без лимита (unlimited) → no_limit (зелёное) →
    limit_override → матч limit_rule по (scope_class, level, exception_kind, expense);
    если передоверие — умножаем на poa_sub_delegation_coeff.
    """
    # 1. Лимит вообще не применяется: доходная сделка или полномочие не под лимитами.
    if authority.deal_direction == DealDirection.income or not authority.limit_applies:
        return _Limit(True, None, no_limit=False, unlimited=True, currency=None)

    # 2. «Без лимита» (зелёное) — явно снятый потолок.
    if authority.is_no_limit or no_limit_cell:
        return _Limit(True, None, no_limit=True, unlimited=False, currency=None)

    # 3. Числовой лимит: override на ячейке, иначе матч из блока limit_rule.
    base: Decimal | None = None
    currency: str | None = None
    if limit_override is not None:
        base = limit_override
        currency = "RUB"
    elif scope_class is not None and authority.limit_class is not None:
        rule = lr_index.get(
            (scope_class, level_id, authority.limit_class, DealDirection.expense)
        )
        if rule is not None:
            base = rule.amount
            currency = rule.currency

    # 4. Передоверие: доля лимита руководителя (глобальный коэффициент).
    if base is not None and is_sub_delegation:
        coeff = Decimal(str(settings.poa_sub_delegation_coeff))
        base = (base * coeff).quantize(Decimal("0.01"))

    return _Limit(True, base, no_limit=False, unlimited=False, currency=currency)


async def regenerate_resolved_grants(db: AsyncSession) -> int:
    """(A) Полный пересчёт материализованных строк resolved_grant. Возвращает их число."""
    authorities = (
        await db.execute(select(Authority).where(Authority.status == AuthorityStatus.active))
    ).scalars().all()
    auth_by_id = {a.id: a for a in authorities}
    scopes = (await db.execute(select(OrgScope))).scalars().all()
    levels = (await db.execute(select(OrgLevel))).scalars().all()
    grants = (await db.execute(select(AuthorityGrant))).scalars().all()
    limit_rules = (await db.execute(select(LimitRule))).scalars().all()

    level_by_id = {lvl.id: lvl for lvl in levels}
    scope_class = {s.id: derive_scope_class(s) for s in scopes}
    scope_ids = [s.id for s in scopes]
    lr_index = {
        (r.scope_class, r.org_level_id, r.exception_kind, r.deal_direction): r
        for r in limit_rules
    }

    cells: dict[tuple[int, int, int], _Cand] = {}
    denials: dict[tuple[int, int, int], int] = {}

    def put(key, priority, derivation, src, no_limit, override, sub_only):
        cur = cells.get(key)
        if cur is None or priority > cur.priority:
            cells[key] = _Cand(priority, derivation, src, no_limit, override, sub_only)

    # 1. Универсальные полномочия — всем скоупам и уровням.
    for a in authorities:
        if a.is_universal:
            for s in scope_ids:
                for lvl in levels:
                    put(
                        (s, lvl.id, a.id), _P_UNIVERSAL, ResolvedDerivation.universal,
                        None, a.is_no_limit, None, False,
                    )

    # 2–3. Авторские ячейки (base_rule) + каскад вверх; учёт явных запретов.
    for g in grants:
        if g.authority_id not in auth_by_id:  # неактивное полномочие — пропускаем
            continue
        explicit_scope = g.org_scope_id is not None
        target_scopes = [g.org_scope_id] if explicit_scope else scope_ids
        gl = level_by_id.get(g.org_level_id)
        if gl is None:
            continue

        if g.granted:
            base_priority = _P_BASE_EXPLICIT if explicit_scope else _P_BASE_ALL_SCOPES
            for s in target_scopes:
                put(
                    (s, g.org_level_id, g.authority_id), base_priority,
                    ResolvedDerivation.base_rule, g.id, g.no_limit, g.limit_override,
                    g.sub_delegation_only,
                )
                # Каскад вверх: выше по иерархии = меньше rank, тот же скоуп.
                for lvl in levels:
                    if lvl.rank < gl.rank:
                        put(
                            (s, lvl.id, g.authority_id), _P_CASCADE,
                            ResolvedDerivation.cascade, g.id, g.no_limit,
                            g.limit_override, g.sub_delegation_only,
                        )
        else:
            deny_priority = _P_BASE_EXPLICIT if explicit_scope else _P_BASE_ALL_SCOPES
            for s in target_scopes:
                key = (s, g.org_level_id, g.authority_id)
                denials[key] = max(denials.get(key, 0), deny_priority)

    # Применяем запреты: убирают ячейку не сильнее себя (явный granted=True переживёт).
    for key, dp in denials.items():
        c = cells.get(key)
        if c is not None and c.priority <= dp:
            del cells[key]

    # Материализуем строки.
    rows: list[ResolvedGrant] = []
    for (scope_id, level_id, auth_id), c in cells.items():
        a = auth_by_id[auth_id]
        lvl = level_by_id[level_id]
        # Передоверие: явный флаг ячейки ИЛИ CEO-4/-5 на сделочном полномочии.
        is_sub = c.sub_only or (
            not lvl.can_conclude_deals_default and a.authority_kind == AuthorityKind.deal
        )
        derivation = ResolvedDerivation.sub_delegation if is_sub else c.derivation
        lim = compute_limit(
            a, scope_class.get(scope_id), level_id,
            no_limit_cell=c.no_limit, limit_override=c.limit_override,
            is_sub_delegation=is_sub, lr_index=lr_index,
        )
        rows.append(
            ResolvedGrant(
                org_scope_id=scope_id, org_level_id=level_id, authority_id=auth_id,
                granted=lim.granted, effective_limit=lim.effective_limit,
                no_limit=lim.no_limit, unlimited=lim.unlimited, currency=lim.currency,
                derivation=derivation, source_grant_id=c.source_grant_id,
            )
        )

    await db.execute(delete(ResolvedGrant))
    db.add_all(rows)
    await db.flush()
    return len(rows)


@dataclass
class ResolvedItem:
    """Строка эффективного полномочия сотрудника (для API resolve)."""
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


async def resolve_employee(db: AsyncSession, employee: Employee) -> list[ResolvedItem]:
    """(B) Эффективные полномочия = resolved_grant по scope+level + одобренные заявки."""
    items: list[ResolvedItem] = []
    seen_auth_ids: set[int] = set()

    if employee.org_level_id is not None and employee.org_scope_id is not None:
        rows = (
            await db.execute(
                select(ResolvedGrant, Authority)
                .join(Authority, Authority.id == ResolvedGrant.authority_id)
                .where(
                    ResolvedGrant.org_scope_id == employee.org_scope_id,
                    ResolvedGrant.org_level_id == employee.org_level_id,
                )
                .order_by(Authority.code)
            )
        ).all()
        for rg, a in rows:
            seen_auth_ids.add(a.id)
            items.append(
                ResolvedItem(
                    authority_id=a.id, code=a.code, name_short=a.name_short,
                    granted=rg.granted, effective_limit=rg.effective_limit,
                    no_limit=rg.no_limit, unlimited=rg.unlimited, currency=rg.currency,
                    derivation=rg.derivation,
                )
            )

    # Одобренные заявки — индивидуальные исключения сверх дефолта по уровню.
    reqs = (
        await db.execute(
            select(AuthorityRequest).where(
                AuthorityRequest.employee_id == employee.id,
                AuthorityRequest.status == RequestStatus.approved,
            )
        )
    ).scalars().all()

    scope = None
    scope_cls = None
    if employee.org_scope_id is not None:
        scope = (
            await db.execute(select(OrgScope).where(OrgScope.id == employee.org_scope_id))
        ).scalar_one_or_none()
        if scope is not None:
            scope_cls = derive_scope_class(scope)
    limit_rules = (await db.execute(select(LimitRule))).scalars().all()
    lr_index = {
        (r.scope_class, r.org_level_id, r.exception_kind, r.deal_direction): r
        for r in limit_rules
    }

    for req in reqs:
        if req.authority_id is not None:
            if req.authority_id in seen_auth_ids:
                continue  # уже есть по уровню — не дублируем
            a = (
                await db.execute(select(Authority).where(Authority.id == req.authority_id))
            ).scalar_one_or_none()
            if a is None:
                continue
            seen_auth_ids.add(a.id)
            lim = compute_limit(
                a, scope_cls, employee.org_level_id or 0,
                no_limit_cell=False, limit_override=None,
                is_sub_delegation=False, lr_index=lr_index,
            )
            items.append(
                ResolvedItem(
                    authority_id=a.id, code=a.code, name_short=a.name_short,
                    granted=True, effective_limit=lim.effective_limit,
                    no_limit=lim.no_limit, unlimited=lim.unlimited, currency=lim.currency,
                    derivation=ResolvedDerivation.manual_exception,
                )
            )
        else:
            # Free-text предложение нового полномочия.
            items.append(
                ResolvedItem(
                    authority_id=None, code=None, name_short=None, granted=True,
                    effective_limit=None, no_limit=False, unlimited=False, currency=None,
                    derivation=ResolvedDerivation.manual_exception,
                    proposed_text=req.proposed_text,
                )
            )

    return items
