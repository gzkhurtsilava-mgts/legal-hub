from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import LimitRule, OrgLevel
from app.models.user import UserRole
from app.schemas.poa import LimitRuleCreate, LimitRuleResponse, LimitRuleUpdate

router = APIRouter(prefix="/limit-rules", tags=["poa-limit-rules"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, rule_id: int) -> LimitRule:
    result = await db.execute(select(LimitRule).where(LimitRule.id == rule_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Правило лимита не найдено")
    return obj


async def _ensure_level_exists(db: AsyncSession, org_level_id: int) -> None:
    exists = (
        await db.execute(select(OrgLevel.id).where(OrgLevel.id == org_level_id))
    ).scalar_one_or_none()
    if exists is None:
        raise HTTPException(status_code=400, detail="Уровень не найден")


async def _ensure_no_duplicate(
    db: AsyncSession,
    *,
    scope_class,
    org_level_id: int,
    exception_kind,
    deal_direction,
    exclude_id: int | None = None,
) -> None:
    """Проверка уникальности (scope_class, org_level_id, exception_kind, deal_direction)."""
    stmt = select(LimitRule.id).where(
        and_(
            LimitRule.scope_class == scope_class,
            LimitRule.org_level_id == org_level_id,
            LimitRule.exception_kind == exception_kind,
            LimitRule.deal_direction == deal_direction,
        )
    )
    if exclude_id is not None:
        stmt = stmt.where(LimitRule.id != exclude_id)
    if (await db.execute(stmt)).scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="Правило лимита с такой комбинацией скоуп-класса, уровня, класса и "
            "направления уже существует",
        )


@router.get("/", response_model=list[LimitRuleResponse])
async def list_limit_rules(
    org_level_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[LimitRule]:
    stmt = select(LimitRule)
    if org_level_id is not None:
        stmt = stmt.where(LimitRule.org_level_id == org_level_id)
    result = await db.execute(
        stmt.order_by(LimitRule.scope_class, LimitRule.org_level_id, LimitRule.exception_kind)
    )
    return result.scalars().all()


@router.post("/", response_model=LimitRuleResponse, status_code=201)
async def create_limit_rule(
    body: LimitRuleCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> LimitRule:
    await _ensure_level_exists(db, body.org_level_id)
    await _ensure_no_duplicate(
        db,
        scope_class=body.scope_class,
        org_level_id=body.org_level_id,
        exception_kind=body.exception_kind,
        deal_direction=body.deal_direction,
    )
    obj = LimitRule(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/{rule_id}", response_model=LimitRuleResponse)
async def get_limit_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> LimitRule:
    return await _get_or_404(db, rule_id)


@router.put("/{rule_id}", response_model=LimitRuleResponse)
async def update_limit_rule(
    rule_id: int,
    body: LimitRuleUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> LimitRule:
    obj = await _get_or_404(db, rule_id)
    data = body.model_dump(exclude_unset=True)
    if "org_level_id" in data:
        await _ensure_level_exists(db, data["org_level_id"])
    # Проверяем дубликат по целевым значениям ДО мутации: иначе autoflush перед
    # SELECT'ом уронит IntegrityError вместо аккуратного 409.
    await _ensure_no_duplicate(
        db,
        scope_class=data.get("scope_class", obj.scope_class),
        org_level_id=data.get("org_level_id", obj.org_level_id),
        exception_kind=data.get("exception_kind", obj.exception_kind),
        deal_direction=data.get("deal_direction", obj.deal_direction),
        exclude_id=rule_id,
    )
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{rule_id}", status_code=204)
async def delete_limit_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, rule_id)
    await db.delete(obj)
