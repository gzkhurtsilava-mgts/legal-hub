"""Модуль «Доверенности» — движок резолвинга (M2).

Две независимые оси:
- ПОДРАЗДЕЛЕНИЕ (org_scope) → какие полномочия доступны. Полномочие вешается на
  узел оргструктуры и наследуется вниз по дереву (сотрудник видит полномочия
  своего узла + всех узлов-предков). org_scope=null → доступно во всех скоупах.
- УРОВЕНЬ (CEO-1 / CEO-2 и ниже) → финансовый лимит. На список полномочий уровень
  не влияет, только на потолок лимита.

(A) `regenerate_resolved_grants` — материализация `resolved_grant` (пул доступного).
(B) `resolve_employee` — пул сотрудника по его scope+level + одобренные заявки.
`compute_limit` — единая точка расчёта лимита по уровню.
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.poa import (
    Authority,
    AuthorityGrant,
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


@dataclass
class _Limit:
    """Результат compute_limit."""
    granted: bool
    effective_limit: Decimal | None
    no_limit: bool
    unlimited: bool
    currency: str | None


def compute_limit(authority: Authority, level_id: int, *, lr_index: dict) -> _Limit:
    """Расчёт лимита по уровню.

    income/limit_applies=false → без лимита (unlimited) → no_limit (зелёное) →
    потолок из limit_rule по уровню.
    """
    # 1. Лимит вообще не применяется: доходная сделка или полномочие не под лимитами.
    if authority.deal_direction == DealDirection.income or not authority.limit_applies:
        return _Limit(True, None, no_limit=False, unlimited=True, currency=None)

    # 2. «Без лимита» (зелёное) — явно снятый потолок.
    if authority.is_no_limit:
        return _Limit(True, None, no_limit=True, unlimited=False, currency=None)

    # 3. Потолок по уровню сотрудника (CEO-1 / CEO-2 и ниже).
    rule = lr_index.get(level_id)
    if rule is not None:
        return _Limit(True, rule.amount, no_limit=False, unlimited=False, currency=rule.currency)
    return _Limit(True, None, no_limit=False, unlimited=False, currency=None)


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

    lr_index = {r.org_level_id: r for r in limit_rules}
    parent_of = {s.id: s.parent_id for s in scopes}

    # Индекс авторских ячеек по узлу; отдельно — «во всех скоупах» (scope=null).
    grants_by_scope: dict[int, list[AuthorityGrant]] = {}
    null_grants: list[AuthorityGrant] = []
    for g in grants:
        if g.authority_id not in auth_by_id:  # неактивное полномочие — пропускаем
            continue
        if g.org_scope_id is None:
            null_grants.append(g)
        else:
            grants_by_scope.setdefault(g.org_scope_id, []).append(g)

    def ancestors(scope_id: int):
        """Цепочка узел → родитель → … → корень (сам узел первым)."""
        seen = 0
        cur: int | None = scope_id
        while cur is not None and seen <= len(scopes):
            yield cur
            cur = parent_of.get(cur)
            seen += 1

    rows: list[ResolvedGrant] = []
    for t in scopes:
        # Для узла t собираем ближайшее правило на каждое полномочие (сам узел > предки).
        resolved: dict[int, tuple[AuthorityGrant | None, ResolvedDerivation]] = {}
        for node_id in ancestors(t.id):
            for g in grants_by_scope.get(node_id, []):
                if g.authority_id not in resolved:
                    deriv = (
                        ResolvedDerivation.base_rule if node_id == t.id
                        else ResolvedDerivation.cascade
                    )
                    resolved[g.authority_id] = (g, deriv)
        # Полномочия «во всех скоупах» — низший приоритет.
        for g in null_grants:
            if g.authority_id not in resolved:
                resolved[g.authority_id] = (g, ResolvedDerivation.universal)
        # Универсальные полномочия — доступны везде без явной ячейки.
        for a in authorities:
            if a.is_universal and a.id not in resolved:
                resolved[a.id] = (None, ResolvedDerivation.universal)

        for auth_id, (g, deriv) in resolved.items():
            if g is not None and not g.granted:
                continue  # явный запрет
            a = auth_by_id[auth_id]
            for lvl in levels:
                lim = compute_limit(a, lvl.id, lr_index=lr_index)
                rows.append(
                    ResolvedGrant(
                        org_scope_id=t.id, org_level_id=lvl.id, authority_id=auth_id,
                        granted=lim.granted, effective_limit=lim.effective_limit,
                        no_limit=lim.no_limit, unlimited=lim.unlimited, currency=lim.currency,
                        derivation=deriv, source_grant_id=g.id if g is not None else None,
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
    """(B) Пул сотрудника = resolved_grant по scope (+level для лимита) + одобренные заявки.

    Уровень влияет только на лимит: при незаданном org_level_id пул полномочий
    возвращается полностью, но суммы лимитов скрыты (effective_limit=None).
    При незаданном org_scope_id остаются универсальные полномочия и гранты
    «во всех скоупах» — они по определению не зависят от подразделения.
    """
    items: list[ResolvedItem] = []
    seen_auth_ids: set[int] = set()

    limit_rules = (await db.execute(select(LimitRule))).scalars().all()
    lr_index = {r.org_level_id: r for r in limit_rules}

    # Уровень: если не задан — берём любой (строки resolved_grant отличаются
    # между уровнями только суммой лимита), а суммы в ответе обнуляем.
    unknown_level = employee.org_level_id is None
    level_id = employee.org_level_id
    if unknown_level:
        level_id = (
            await db.execute(select(OrgLevel.id).order_by(OrgLevel.rank.desc()).limit(1))
        ).scalar_one_or_none()

    if employee.org_scope_id is not None and level_id is not None:
        rows = (
            await db.execute(
                select(ResolvedGrant, Authority)
                .join(Authority, Authority.id == ResolvedGrant.authority_id)
                .where(
                    ResolvedGrant.org_scope_id == employee.org_scope_id,
                    ResolvedGrant.org_level_id == level_id,
                )
                .order_by(Authority.code)
            )
        ).all()
        for rg, a in rows:
            seen_auth_ids.add(a.id)
            items.append(
                ResolvedItem(
                    authority_id=a.id, code=a.code, name_short=a.name_short,
                    granted=rg.granted,
                    effective_limit=None if unknown_level else rg.effective_limit,
                    no_limit=rg.no_limit, unlimited=rg.unlimited,
                    currency=None if unknown_level else rg.currency,
                    derivation=rg.derivation,
                )
            )
    elif employee.org_scope_id is None:
        # Без подразделения: универсальные полномочия и гранты «во всех скоупах»
        # (явный запрет в null-гранте блокирует и универсальное — как в (A)).
        null_grants = (
            await db.execute(
                select(AuthorityGrant).where(AuthorityGrant.org_scope_id.is_(None))
            )
        ).scalars().all()
        denied_ids = {g.authority_id for g in null_grants if not g.granted}
        null_grant_ids = {g.authority_id for g in null_grants if g.granted}
        auths = (
            await db.execute(
                select(Authority)
                .where(Authority.status == AuthorityStatus.active)
                .order_by(Authority.code)
            )
        ).scalars().all()
        for a in auths:
            if a.id in denied_ids:
                continue
            if not a.is_universal and a.id not in null_grant_ids:
                continue
            lim = compute_limit(a, level_id or 0, lr_index=lr_index)
            seen_auth_ids.add(a.id)
            items.append(
                ResolvedItem(
                    authority_id=a.id, code=a.code, name_short=a.name_short,
                    granted=True,
                    effective_limit=None if unknown_level else lim.effective_limit,
                    no_limit=lim.no_limit, unlimited=lim.unlimited,
                    currency=None if unknown_level else lim.currency,
                    derivation=ResolvedDerivation.universal,
                )
            )

    # Одобренные заявки — индивидуальные исключения сверх пула по подразделению.
    reqs = (
        await db.execute(
            select(AuthorityRequest).where(
                AuthorityRequest.employee_id == employee.id,
                AuthorityRequest.status == RequestStatus.approved,
            )
        )
    ).scalars().all()

    # Полномочия по заявкам — одним запросом (без N+1 в цикле).
    req_auth_ids = [
        r.authority_id for r in reqs
        if r.authority_id is not None and r.authority_id not in seen_auth_ids
    ]
    auth_by_id: dict[int, Authority] = {}
    if req_auth_ids:
        auth_by_id = {
            a.id: a
            for a in (
                await db.execute(select(Authority).where(Authority.id.in_(req_auth_ids)))
            ).scalars().all()
        }

    for req in reqs:
        if req.authority_id is not None:
            if req.authority_id in seen_auth_ids:
                continue  # уже есть по подразделению — не дублируем
            a = auth_by_id.get(req.authority_id)
            if a is None:
                continue
            seen_auth_ids.add(a.id)
            lim = compute_limit(a, employee.org_level_id or 0, lr_index=lr_index)
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
