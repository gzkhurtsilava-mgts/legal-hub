from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user, require_role
from app.models.processes import PmDomain, PmProcess
from app.models.user import UserRole
from app.schemas.processes import (
    PmDomainCreate,
    PmDomainResponse,
    PmDomainUpdate,
    PmProcessResponse,
)

router = APIRouter(prefix="/domains", tags=["processes-domains"])

_EDITOR = Depends(require_role(UserRole.admin, UserRole.lawyer))
_AUTH = Depends(get_current_user)


async def _get_or_404(db: AsyncSession, domain_id: str) -> PmDomain:
    result = await db.execute(select(PmDomain).where(PmDomain.id == domain_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Домен не найден")
    return obj


async def _inject_counts(db: AsyncSession, domain: PmDomain) -> PmDomainResponse:
    counts = (
        await db.execute(
            select(
                PmProcess.type,
                func.count().label("cnt"),
            )
            .where(PmProcess.domain_id == domain.id)
            .group_by(PmProcess.type)
        )
    ).all()

    workflow_count = sum(c.cnt for c in counts if c.type.value == "workflow")
    service_count = sum(c.cnt for c in counts if c.type.value == "service")
    total = workflow_count + service_count

    resp = PmDomainResponse.model_validate(domain)
    resp.workflow_count = workflow_count
    resp.service_count = service_count
    resp.process_count = total
    return resp


@router.get("/", response_model=list[PmDomainResponse])
async def list_domains(
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmDomainResponse]:
    result = await db.execute(select(PmDomain).order_by(PmDomain.name))
    domains = result.scalars().all()
    return [await _inject_counts(db, d) for d in domains]


@router.post("/", response_model=PmDomainResponse, status_code=201)
async def create_domain(
    body: PmDomainCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmDomainResponse:
    existing = await db.execute(select(PmDomain).where(PmDomain.id == body.id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"Домен с ID '{body.id}' уже существует")
    obj = PmDomain(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return await _inject_counts(db, obj)


@router.get("/{domain_id}", response_model=PmDomainResponse)
async def get_domain(
    domain_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmDomainResponse:
    obj = await _get_or_404(db, domain_id)
    return await _inject_counts(db, obj)


@router.put("/{domain_id}", response_model=PmDomainResponse)
async def update_domain(
    domain_id: str,
    body: PmDomainUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmDomainResponse:
    obj = await _get_or_404(db, domain_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return await _inject_counts(db, obj)


@router.delete("/{domain_id}", status_code=204)
async def delete_domain(
    domain_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, domain_id)
    # Guard: don't delete if processes exist
    proc_count = (
        await db.execute(
            select(func.count()).select_from(PmProcess).where(PmProcess.domain_id == domain_id)
        )
    ).scalar_one()
    if proc_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: домен содержит {proc_count} процессов",
        )
    await db.delete(obj)


@router.get("/{domain_id}/processes", response_model=list[PmProcessResponse])
async def list_domain_processes(
    domain_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmProcessResponse]:
    await _get_or_404(db, domain_id)
    result = await db.execute(
        select(PmProcess)
        .where(PmProcess.domain_id == domain_id)
        .order_by(PmProcess.type, PmProcess.name)
    )
    return result.scalars().all()
