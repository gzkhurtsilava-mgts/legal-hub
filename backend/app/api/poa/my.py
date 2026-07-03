"""Модуль «Доверенности» — личный кабинет сотрудника (Модуль 5).

Тонкий персонализированный срез поверх реестра и заявок. Доступен любому
аутентифицированному пользователю (самообслуживание).

Связка «сотрудник ↔ учётная запись» пока по ФИО (User.full_name), т.к. SSO нет.
При появлении SSO заменить на устойчивый идентификатор (user_id/tab_number).
"""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user
from app.models.poa import (
    Authority,
    AuthorityRequest,
    CertificateStatus,
    Employee,
    PoaCertificate,
)
from app.schemas.poa import CertificateResponse, MyRequestOut

router = APIRouter(prefix="/my", tags=["poa-my"])

_AUTH = Depends(get_current_user)


async def _expire_overdue(db: AsyncSession) -> None:
    await db.execute(
        update(PoaCertificate)
        .where(
            PoaCertificate.status == CertificateStatus.active,
            PoaCertificate.valid_to.is_not(None),
            PoaCertificate.valid_to < date.today(),
        )
        .values(status=CertificateStatus.expired)
    )


@router.get("/certificates", response_model=list[CertificateResponse])
async def my_certificates(
    db: AsyncSession = Depends(get_db),
    user: UserContext = _AUTH,
) -> list[PoaCertificate]:
    await _expire_overdue(db)
    result = await db.execute(
        select(PoaCertificate)
        .options(selectinload(PoaCertificate.authorities))
        .where(PoaCertificate.grantee_fio == user.full_name)
        .order_by(PoaCertificate.issued_date.desc())
    )
    return result.scalars().all()


@router.get("/requests", response_model=list[MyRequestOut])
async def my_requests(
    db: AsyncSession = Depends(get_db),
    user: UserContext = _AUTH,
) -> list[MyRequestOut]:
    rows = (
        await db.execute(
            select(AuthorityRequest, Authority.code, Authority.name_short)
            .join(Employee, Employee.id == AuthorityRequest.employee_id)
            .outerjoin(Authority, Authority.id == AuthorityRequest.authority_id)
            .where(Employee.fio == user.full_name)
            .order_by(AuthorityRequest.created_at.desc())
        )
    ).all()
    return [
        MyRequestOut(
            id=req.id,
            authority_code=code,
            authority_name=name,
            proposed_text=req.proposed_text,
            justification=req.justification,
            status=req.status,
            created_at=req.created_at,
        )
        for req, code, name in rows
    ]
