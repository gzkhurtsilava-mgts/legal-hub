"""Модуль «Доверенности» — личный кабинет сотрудника (Модуль 5).

Тонкий персонализированный срез поверх реестра и заявок. Доступен любому
аутентифицированному пользователю (самообслуживание).

Связка «сотрудник ↔ учётная запись» пока по ФИО (User.full_name), т.к. SSO нет:
сравнение нормализованное (пробелы, регистр, ё→е), доверенности дополнительно
подтягиваются по FK grantee_employee_id. Единая точка связки —
`_employee_ids_for_user`. Коллизию полных тёзок разрешит только SSO
(user_id/tab_number) — при его появлении заменить связку здесь.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user
from app.models.poa import (
    Authority,
    AuthorityRequest,
    Employee,
    PoaCertificate,
)
from app.schemas.poa import CertificateResponse, MyRequestOut

router = APIRouter(prefix="/my", tags=["poa-my"])

_AUTH = Depends(get_current_user)


def _norm_py(fio: str) -> str:
    """Нормализация ФИО: схлопнуть пробелы, нижний регистр, ё→е."""
    return " ".join(fio.split()).lower().replace("ё", "е")


def _norm_sql(col):
    """SQL-зеркало _norm_py (для сравнения на стороне БД)."""
    collapsed = func.btrim(func.regexp_replace(col, r"\s+", " ", "g"))
    return func.replace(func.lower(collapsed), "ё", "е")


async def _employee_ids_for_user(db: AsyncSession, user: UserContext) -> list[int]:
    """Сотрудники, соответствующие учётке, — единая точка связки для /my."""
    rows = await db.execute(
        select(Employee.id).where(_norm_sql(Employee.fio) == _norm_py(user.full_name))
    )
    return list(rows.scalars().all())


@router.get("/certificates", response_model=list[CertificateResponse])
async def my_certificates(
    db: AsyncSession = Depends(get_db),
    user: UserContext = _AUTH,
) -> list[PoaCertificate]:
    emp_ids = await _employee_ids_for_user(db, user)
    fio_match = _norm_sql(PoaCertificate.grantee_fio) == _norm_py(user.full_name)
    cond = (
        or_(PoaCertificate.grantee_employee_id.in_(emp_ids), fio_match)
        if emp_ids
        else fio_match
    )
    result = await db.execute(
        select(PoaCertificate)
        .options(selectinload(PoaCertificate.authorities))
        .where(cond)
        .order_by(PoaCertificate.issued_date.desc())
    )
    return result.scalars().all()


@router.get("/requests", response_model=list[MyRequestOut])
async def my_requests(
    db: AsyncSession = Depends(get_db),
    user: UserContext = _AUTH,
) -> list[MyRequestOut]:
    emp_ids = await _employee_ids_for_user(db, user)
    if not emp_ids:
        return []
    rows = (
        await db.execute(
            select(AuthorityRequest, Authority.code, Authority.name_short)
            .outerjoin(Authority, Authority.id == AuthorityRequest.authority_id)
            .where(AuthorityRequest.employee_id.in_(emp_ids))
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
