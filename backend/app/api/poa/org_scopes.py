from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.poa.common import reject_nulls_for_required
from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import AuthorityGrant, Employee, OrgScope
from app.models.user import UserRole
from app.schemas.poa import OrgScopeCreate, OrgScopeResponse, OrgScopeUpdate
from app.services.poa.resolver import regenerate_resolved_grants

router = APIRouter(prefix="/org-scopes", tags=["poa-org-scopes"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, scope_id: int) -> OrgScope:
    result = await db.execute(select(OrgScope).where(OrgScope.id == scope_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Орг-скоуп не найден")
    return obj


async def _ensure_parent_exists(db: AsyncSession, parent_id: int | None) -> None:
    if parent_id is None:
        return
    exists = (
        await db.execute(select(OrgScope.id).where(OrgScope.id == parent_id))
    ).scalar_one_or_none()
    if exists is None:
        raise HTTPException(status_code=400, detail="Родительский орг-скоуп не найден")


@router.get("/", response_model=list[OrgScopeResponse])
async def list_org_scopes(
    company: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[OrgScope]:
    stmt = select(OrgScope)
    if company is not None:
        stmt = stmt.where(OrgScope.company == company)
    result = await db.execute(stmt.order_by(OrgScope.company, OrgScope.name))
    return result.scalars().all()


@router.post("/", response_model=OrgScopeResponse, status_code=201)
async def create_org_scope(
    body: OrgScopeCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgScope:
    await _ensure_parent_exists(db, body.parent_id)
    obj = OrgScope(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    # Новый узел должен сразу получить строки resolved_grant (наследование).
    await regenerate_resolved_grants(db)
    return obj


@router.get("/{scope_id}", response_model=OrgScopeResponse)
async def get_org_scope(
    scope_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgScope:
    return await _get_or_404(db, scope_id)


@router.put("/{scope_id}", response_model=OrgScopeResponse)
async def update_org_scope(
    scope_id: int,
    body: OrgScopeUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> OrgScope:
    obj = await _get_or_404(db, scope_id)
    data = body.model_dump(exclude_unset=True)
    reject_nulls_for_required(OrgScope, data)
    if "parent_id" in data:
        if data["parent_id"] == scope_id:
            raise HTTPException(status_code=400, detail="Орг-скоуп не может быть своим родителем")
        await _ensure_parent_exists(db, data["parent_id"])
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    # Смена родителя меняет цепочку наследования — пересчитываем.
    await regenerate_resolved_grants(db)
    return obj


@router.delete("/{scope_id}", status_code=204)
async def delete_org_scope(
    scope_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, scope_id)
    child_count = (
        await db.execute(
            select(func.count()).select_from(OrgScope).where(OrgScope.parent_id == scope_id)
        )
    ).scalar_one()
    if child_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: скоуп содержит {child_count} вложенных",
        )
    grant_count = (
        await db.execute(
            select(func.count())
            .select_from(AuthorityGrant)
            .where(AuthorityGrant.org_scope_id == scope_id)
        )
    ).scalar_one()
    if grant_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: скоуп используется в {grant_count} ячейках матрицы",
        )
    emp_count = (
        await db.execute(
            select(func.count()).select_from(Employee).where(Employee.org_scope_id == scope_id)
        )
    ).scalar_one()
    if emp_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: к скоупу привязано {emp_count} сотрудников",
        )
    await db.delete(obj)
    await db.flush()
    await regenerate_resolved_grants(db)
