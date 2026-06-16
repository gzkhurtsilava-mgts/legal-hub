from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user, require_role
from app.models.processes import PmActivity, PmProcess, PmSop
from app.models.user import UserRole
from app.schemas.processes import PmActivityCreate, PmActivityResponse, PmActivityUpdate


class _ReorderItem(BaseModel):
    id: str
    order_index: int

router = APIRouter(tags=["processes-l4"])

_EDITOR = Depends(require_role(UserRole.admin, UserRole.lawyer))
_AUTH = Depends(get_current_user)


async def _get_process_or_404(db: AsyncSession, process_id: str) -> PmProcess:
    result = await db.execute(select(PmProcess).where(PmProcess.id == process_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Процесс не найден")
    return obj


async def _get_or_404(db: AsyncSession, process_id: str, activity_id: str) -> PmActivity:
    result = await db.execute(
        select(PmActivity).where(
            PmActivity.id == activity_id,
            PmActivity.parent_process_id == process_id,
        )
    )
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Активность не найдена")
    return obj


@router.get("/{process_id}/activities/", response_model=list[PmActivityResponse])
async def list_activities(
    process_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmActivityResponse]:
    await _get_process_or_404(db, process_id)
    result = await db.execute(
        select(PmActivity)
        .where(PmActivity.parent_process_id == process_id)
        .order_by(PmActivity.order_index, PmActivity.id)
    )
    return result.scalars().all()


@router.post("/{process_id}/activities/", response_model=PmActivityResponse, status_code=201)
async def create_activity(
    process_id: str,
    body: PmActivityCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmActivityResponse:
    await _get_process_or_404(db, process_id)
    existing = await db.execute(select(PmActivity).where(PmActivity.id == body.id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"Активность с ID '{body.id}' уже существует")
    data = body.model_dump()
    data["parent_process_id"] = process_id  # enforce URL param, ignore body claim
    obj = PmActivity(**data)
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


# Must be declared BEFORE /{activity_id} to avoid "reorder" being matched as an id
@router.put("/{process_id}/activities/reorder")
async def reorder_activities(
    process_id: str,
    body: list[_ReorderItem],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_process_or_404(db, process_id)
    for item in body:
        result = await db.execute(
            select(PmActivity).where(
                PmActivity.id == item.id,
                PmActivity.parent_process_id == process_id,
            )
        )
        obj = result.scalar_one_or_none()
        if obj:
            obj.order_index = item.order_index
    await db.flush()
    return {"ok": True}


@router.get("/{process_id}/activities/{activity_id}", response_model=PmActivityResponse)
async def get_activity(
    process_id: str,
    activity_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmActivityResponse:
    return await _get_or_404(db, process_id, activity_id)


@router.put("/{process_id}/activities/{activity_id}", response_model=PmActivityResponse)
async def update_activity(
    process_id: str,
    activity_id: str,
    body: PmActivityUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmActivityResponse:
    obj = await _get_or_404(db, process_id, activity_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{process_id}/activities/{activity_id}", status_code=204)
async def delete_activity(
    process_id: str,
    activity_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, process_id, activity_id)
    sop_count = (
        await db.execute(
            select(func.count()).select_from(PmSop).where(PmSop.parent_activity_id == activity_id)
        )
    ).scalar_one()
    if sop_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: активность содержит {sop_count} СОП",
        )
    await db.delete(obj)
