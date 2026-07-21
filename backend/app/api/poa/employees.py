from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.poa.common import reject_nulls_for_required
from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import AuthorityRequest, Employee, OrgLevel, OrgScope
from app.models.user import UserRole
from app.schemas.poa import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["poa-employees"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


async def _get_or_404(db: AsyncSession, employee_id: int) -> Employee:
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")
    return obj


async def _validate_refs(
    db: AsyncSession, org_scope_id: int | None, org_level_id: int | None
) -> None:
    if org_scope_id is not None and (
        await db.execute(select(OrgScope.id).where(OrgScope.id == org_scope_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Орг-скоуп не найден")
    if org_level_id is not None and (
        await db.execute(select(OrgLevel.id).where(OrgLevel.id == org_level_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Уровень не найден")


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees(
    company: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[Employee]:
    stmt = select(Employee)
    if company is not None:
        stmt = stmt.where(Employee.company == company)
    result = await db.execute(stmt.order_by(Employee.fio))
    return result.scalars().all()


@router.post("/", response_model=EmployeeResponse, status_code=201)
async def create_employee(
    body: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> Employee:
    await _validate_refs(db, body.org_scope_id, body.org_level_id)
    obj = Employee(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> Employee:
    return await _get_or_404(db, employee_id)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    body: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> Employee:
    obj = await _get_or_404(db, employee_id)
    data = body.model_dump(exclude_unset=True)
    reject_nulls_for_required(Employee, data)
    await _validate_refs(db, data.get("org_scope_id"), data.get("org_level_id"))
    for key, val in data.items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> None:
    obj = await _get_or_404(db, employee_id)
    req_count = (
        await db.execute(
            select(func.count())
            .select_from(AuthorityRequest)
            .where(AuthorityRequest.employee_id == employee_id)
        )
    ).scalar_one()
    if req_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: у сотрудника {req_count} заявок",
        )
    await db.delete(obj)
