from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.poa.common import reject_nulls_for_required
from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Employee, LimitRule, OrgLevel
from app.models.user import UserRole
from app.schemas.poa import OrgLevelCreate, OrgLevelResponse, OrgLevelUpdate

router = APIRouter(prefix="/org-levels", tags=["poa-org-levels"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, level_id: int) -> OrgLevel:
    result = await db.execute(select(OrgLevel).where(OrgLevel.id == level_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Уровень не найден")
    return obj


async def _ensure_unique(
    db: AsyncSession, *, code: str | None, rank: int | None, exclude_id: int | None = None
) -> None:
    if code is not None:
        stmt = select(OrgLevel.id).where(OrgLevel.code == code)
        if exclude_id is not None:
            stmt = stmt.where(OrgLevel.id != exclude_id)
        if (await db.execute(stmt)).scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail=f"Уровень с кодом '{code}' уже существует")
    if rank is not None:
        stmt = select(OrgLevel.id).where(OrgLevel.rank == rank)
        if exclude_id is not None:
            stmt = stmt.where(OrgLevel.id != exclude_id)
        if (await db.execute(stmt)).scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail=f"Уровень с рангом {rank} уже существует")


@router.get("/", response_model=list[OrgLevelResponse])
async def list_org_levels(
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[OrgLevel]:
    result = await db.execute(select(OrgLevel).order_by(OrgLevel.rank))
    return result.scalars().all()


@router.post("/", response_model=OrgLevelResponse, status_code=201)
async def create_org_level(
    body: OrgLevelCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgLevel:
    await _ensure_unique(db, code=body.code, rank=body.rank)
    obj = OrgLevel(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/{level_id}", response_model=OrgLevelResponse)
async def get_org_level(
    level_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgLevel:
    return await _get_or_404(db, level_id)


@router.put("/{level_id}", response_model=OrgLevelResponse)
async def update_org_level(
    level_id: int,
    body: OrgLevelUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgLevel:
    obj = await _get_or_404(db, level_id)
    data = body.model_dump(exclude_unset=True)
    reject_nulls_for_required(OrgLevel, data)
    await _ensure_unique(
        db,
        code=data.get("code") if data.get("code") != obj.code else None,
        rank=data.get("rank") if data.get("rank") != obj.rank else None,
        exclude_id=level_id,
    )
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{level_id}", status_code=204)
async def delete_org_level(
    level_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, level_id)
    for model, field, label in (
        (LimitRule, LimitRule.org_level_id, "правилах лимитов"),
        (Employee, Employee.org_level_id, "сотрудниках"),
    ):
        count = (
            await db.execute(select(func.count()).select_from(model).where(field == level_id))
        ).scalar_one()
        if count > 0:
            raise HTTPException(
                status_code=409,
                detail=f"Невозможно удалить: уровень используется в {count} {label}",
            )
    await db.delete(obj)
