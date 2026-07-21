from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.poa.common import reject_nulls_for_required
from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Authority, AuthorityCategory
from app.models.user import UserRole
from app.schemas.poa import (
    AuthorityCategoryCreate,
    AuthorityCategoryResponse,
    AuthorityCategoryUpdate,
)

router = APIRouter(prefix="/categories", tags=["poa-categories"])

# Каталог/матрица/лимиты — домен юриста. И чтение, и запись только для юриста/админа.
_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, category_id: int) -> AuthorityCategory:
    result = await db.execute(
        select(AuthorityCategory).where(AuthorityCategory.id == category_id)
    )
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return obj


async def _ensure_parent_exists(db: AsyncSession, parent_id: int | None) -> None:
    if parent_id is None:
        return
    exists = (
        await db.execute(select(AuthorityCategory.id).where(AuthorityCategory.id == parent_id))
    ).scalar_one_or_none()
    if exists is None:
        raise HTTPException(status_code=400, detail="Родительская категория не найдена")


@router.get("/", response_model=list[AuthorityCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[AuthorityCategory]:
    result = await db.execute(
        select(AuthorityCategory).order_by(
            AuthorityCategory.level, AuthorityCategory.sort_order, AuthorityCategory.name
        )
    )
    return result.scalars().all()


@router.post("/", response_model=AuthorityCategoryResponse, status_code=201)
async def create_category(
    body: AuthorityCategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> AuthorityCategory:
    await _ensure_parent_exists(db, body.parent_id)
    obj = AuthorityCategory(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/{category_id}", response_model=AuthorityCategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> AuthorityCategory:
    return await _get_or_404(db, category_id)


@router.put("/{category_id}", response_model=AuthorityCategoryResponse)
async def update_category(
    category_id: int,
    body: AuthorityCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> AuthorityCategory:
    obj = await _get_or_404(db, category_id)
    data = body.model_dump(exclude_unset=True)
    reject_nulls_for_required(AuthorityCategory, data)
    if "parent_id" in data:
        if data["parent_id"] == category_id:
            raise HTTPException(status_code=400, detail="Категория не может быть своим родителем")
        await _ensure_parent_exists(db, data["parent_id"])
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, category_id)
    child_count = (
        await db.execute(
            select(func.count())
            .select_from(AuthorityCategory)
            .where(AuthorityCategory.parent_id == category_id)
        )
    ).scalar_one()
    if child_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: категория содержит {child_count} подкатегорий",
        )
    auth_count = (
        await db.execute(
            select(func.count())
            .select_from(Authority)
            .where(Authority.category_id == category_id)
        )
    ).scalar_one()
    if auth_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: в категории {auth_count} полномочий",
        )
    await db.delete(obj)
