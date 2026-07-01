from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Authority, AuthorityCategory, AuthorityGrant
from app.models.poa import poa_certificate_authorities as cert_auth
from app.models.user import UserRole
from app.schemas.poa import AuthorityCreate, AuthorityResponse, AuthorityUpdate

router = APIRouter(prefix="/authorities", tags=["poa-authorities"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, authority_id: int) -> Authority:
    result = await db.execute(select(Authority).where(Authority.id == authority_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Полномочие не найдено")
    return obj


async def _ensure_category_exists(db: AsyncSession, category_id: int) -> None:
    exists = (
        await db.execute(select(AuthorityCategory.id).where(AuthorityCategory.id == category_id))
    ).scalar_one_or_none()
    if exists is None:
        raise HTTPException(status_code=400, detail="Категория не найдена")


async def _ensure_code_free(db: AsyncSession, code: str, exclude_id: int | None = None) -> None:
    stmt = select(Authority.id).where(Authority.code == code)
    if exclude_id is not None:
        stmt = stmt.where(Authority.id != exclude_id)
    if (await db.execute(stmt)).scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"Полномочие с кодом '{code}' уже существует")


@router.get("/", response_model=list[AuthorityResponse])
async def list_authorities(
    category_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[Authority]:
    stmt = select(Authority)
    if category_id is not None:
        stmt = stmt.where(Authority.category_id == category_id)
    result = await db.execute(stmt.order_by(Authority.code))
    return result.scalars().all()


@router.post("/", response_model=AuthorityResponse, status_code=201)
async def create_authority(
    body: AuthorityCreate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> Authority:
    await _ensure_code_free(db, body.code)
    await _ensure_category_exists(db, body.category_id)
    obj = Authority(**body.model_dump(), updated_by=user.email)
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/{authority_id}", response_model=AuthorityResponse)
async def get_authority(
    authority_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> Authority:
    return await _get_or_404(db, authority_id)


@router.put("/{authority_id}", response_model=AuthorityResponse)
async def update_authority(
    authority_id: int,
    body: AuthorityUpdate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> Authority:
    obj = await _get_or_404(db, authority_id)
    data = body.model_dump(exclude_unset=True)
    if "code" in data and data["code"] != obj.code:
        await _ensure_code_free(db, data["code"], exclude_id=authority_id)
    if "category_id" in data:
        await _ensure_category_exists(db, data["category_id"])
    for key, val in data.items():
        setattr(obj, key, val)
    obj.updated_by = user.email
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{authority_id}", status_code=204)
async def delete_authority(
    authority_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, authority_id)
    grant_count = (
        await db.execute(
            select(func.count())
            .select_from(AuthorityGrant)
            .where(AuthorityGrant.authority_id == authority_id)
        )
    ).scalar_one()
    if grant_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: полномочие выдано в {grant_count} ячейках матрицы",
        )
    cert_count = (
        await db.execute(
            select(func.count())
            .select_from(cert_auth)
            .where(cert_auth.c.authority_id == authority_id)
        )
    ).scalar_one()
    if cert_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: полномочие включено в {cert_count} доверенностей",
        )
    await db.delete(obj)
