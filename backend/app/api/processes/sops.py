from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user, require_role
from app.models.processes import PmActivity, PmSop
from app.models.user import UserRole
from app.schemas.processes import PmSopCreate, PmSopResponse, PmSopUpdate

router = APIRouter(tags=["processes-l5"])

_EDITOR = Depends(require_role(UserRole.admin, UserRole.lawyer))
_AUTH = Depends(get_current_user)


async def _get_activity_or_404(db: AsyncSession, process_id: str, activity_id: str) -> PmActivity:
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


async def _get_or_404(db: AsyncSession, activity_id: str, sop_id: str) -> PmSop:
    result = await db.execute(
        select(PmSop).where(PmSop.id == sop_id, PmSop.parent_activity_id == activity_id)
    )
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="СОП не найден")
    return obj


@router.get(
    "/{process_id}/activities/{activity_id}/sops/",
    response_model=list[PmSopResponse],
)
async def list_sops(
    process_id: str,
    activity_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmSopResponse]:
    await _get_activity_or_404(db, process_id, activity_id)
    result = await db.execute(
        select(PmSop).where(PmSop.parent_activity_id == activity_id).order_by(PmSop.id)
    )
    return result.scalars().all()


@router.post(
    "/{process_id}/activities/{activity_id}/sops/",
    response_model=PmSopResponse,
    status_code=201,
)
async def create_sop(
    process_id: str,
    activity_id: str,
    body: PmSopCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmSopResponse:
    await _get_activity_or_404(db, process_id, activity_id)
    existing = await db.execute(select(PmSop).where(PmSop.id == body.id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"СОП с ID '{body.id}' уже существует")
    data = body.model_dump()
    data["parent_activity_id"] = activity_id  # enforce URL param, ignore body claim
    obj = PmSop(**data)
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get(
    "/{process_id}/activities/{activity_id}/sops/{sop_id}",
    response_model=PmSopResponse,
)
async def get_sop(
    process_id: str,
    activity_id: str,
    sop_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmSopResponse:
    await _get_activity_or_404(db, process_id, activity_id)
    return await _get_or_404(db, activity_id, sop_id)


@router.put(
    "/{process_id}/activities/{activity_id}/sops/{sop_id}",
    response_model=PmSopResponse,
)
async def update_sop(
    process_id: str,
    activity_id: str,
    sop_id: str,
    body: PmSopUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmSopResponse:
    await _get_activity_or_404(db, process_id, activity_id)
    obj = await _get_or_404(db, activity_id, sop_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete(
    "/{process_id}/activities/{activity_id}/sops/{sop_id}",
    status_code=204,
)
async def delete_sop(
    process_id: str,
    activity_id: str,
    sop_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    await _get_activity_or_404(db, process_id, activity_id)
    obj = await _get_or_404(db, activity_id, sop_id)
    await db.delete(obj)
