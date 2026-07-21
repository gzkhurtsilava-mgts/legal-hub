from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.poa.common import reject_nulls_for_required
from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import AuditAction, LimitRule, OrgLevel
from app.models.user import UserRole
from app.schemas.poa import LimitRuleCreate, LimitRuleResponse, LimitRuleUpdate
from app.services.poa.audit import snapshot, write_audit
from app.services.poa.resolver import regenerate_resolved_grants

router = APIRouter(prefix="/limit-rules", tags=["poa-limit-rules"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))

_LIMIT_FIELDS = ["org_level_id", "amount", "currency"]


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
    db: AsyncSession, org_level_id: int, exclude_id: int | None = None
) -> None:
    """Один лимит на уровень (уникальность по org_level_id)."""
    stmt = select(LimitRule.id).where(LimitRule.org_level_id == org_level_id)
    if exclude_id is not None:
        stmt = stmt.where(LimitRule.id != exclude_id)
    if (await db.execute(stmt)).scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409, detail="Лимит для этого уровня уже задан"
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
    result = await db.execute(stmt.order_by(LimitRule.org_level_id))
    return result.scalars().all()


@router.post("/", response_model=LimitRuleResponse, status_code=201)
async def create_limit_rule(
    body: LimitRuleCreate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> LimitRule:
    await _ensure_level_exists(db, body.org_level_id)
    await _ensure_no_duplicate(db, body.org_level_id)
    obj = LimitRule(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    await write_audit(
        db, entity_type="limit_rule", entity_id=obj.id,
        action=AuditAction.create, user_id=user.id, after=snapshot(obj, _LIMIT_FIELDS),
    )
    # Лимиты материализованы в resolved_grant — пересчитываем сразу.
    await regenerate_resolved_grants(db)
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
    user: UserContext = _LAWYER,
) -> LimitRule:
    obj = await _get_or_404(db, rule_id)
    data = body.model_dump(exclude_unset=True)
    reject_nulls_for_required(LimitRule, data)
    if "org_level_id" in data:
        await _ensure_level_exists(db, data["org_level_id"])
        await _ensure_no_duplicate(db, data["org_level_id"], exclude_id=rule_id)
    before = snapshot(obj, _LIMIT_FIELDS)
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    await write_audit(
        db, entity_type="limit_rule", entity_id=obj.id,
        action=AuditAction.update, user_id=user.id,
        before=before, after=snapshot(obj, _LIMIT_FIELDS),
    )
    await regenerate_resolved_grants(db)
    return obj


@router.delete("/{rule_id}", status_code=204)
async def delete_limit_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, rule_id)
    await write_audit(
        db, entity_type="limit_rule", entity_id=obj.id,
        action=AuditAction.delete, user_id=user.id, before=snapshot(obj, _LIMIT_FIELDS),
    )
    await db.delete(obj)
    await db.flush()
    await regenerate_resolved_grants(db)
