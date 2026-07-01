from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Employee
from app.models.user import UserRole
from app.schemas.poa import ResolvedAuthorityOut, ResolveResponse
from app.services.poa.resolver import resolve_employee

router = APIRouter(prefix="/resolve", tags=["poa-resolve"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


@router.get("/{employee_id}", response_model=ResolveResponse)
async def resolve(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> ResolveResponse:
    employee = (
        await db.execute(select(Employee).where(Employee.id == employee_id))
    ).scalar_one_or_none()
    if employee is None:
        raise HTTPException(status_code=404, detail="Сотрудник не найден")

    items = await resolve_employee(db, employee)
    return ResolveResponse(
        employee_id=employee.id,
        org_scope_id=employee.org_scope_id,
        org_level_id=employee.org_level_id,
        authorities=[ResolvedAuthorityOut(**item.__dict__) for item in items],
    )
