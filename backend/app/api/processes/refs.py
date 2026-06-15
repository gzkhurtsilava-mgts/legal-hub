from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user, require_role
from app.models.processes import (
    PmBusinessUnit,
    PmDocType,
    PmPolicy,
    PmRegulation,
    PmRisk,
    PmRole,
    PmSystem,
)
from app.models.user import UserRole
from app.schemas.processes import (
    PmBusinessUnitCreate,
    PmBusinessUnitResponse,
    PmBusinessUnitUpdate,
    PmDocTypeCreate,
    PmDocTypeResponse,
    PmDocTypeUpdate,
    PmPolicyCreate,
    PmPolicyResponse,
    PmPolicyUpdate,
    PmRegulationCreate,
    PmRegulationResponse,
    PmRegulationUpdate,
    PmRiskCreate,
    PmRiskResponse,
    PmRiskUpdate,
    PmRoleCreate,
    PmRoleResponse,
    PmRoleUpdate,
    PmSystemCreate,
    PmSystemResponse,
    PmSystemUpdate,
)

router = APIRouter(prefix="/refs", tags=["processes-refs"])

_EDITOR = Depends(require_role(UserRole.admin, UserRole.lawyer))
_AUTH = Depends(get_current_user)


# ─── Helper ───────────────────────────────────────────────────────────────────


async def _get_or_404(db: AsyncSession, model_cls, item_id: int):
    result = await db.execute(select(model_cls).where(model_cls.id == item_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return obj


# ─── Roles ────────────────────────────────────────────────────────────────────


@router.get("/roles/", response_model=list[PmRoleResponse])
async def list_roles(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmRoleResponse]:
    stmt = select(PmRole).order_by(PmRole.name)
    if q:
        stmt = stmt.where(PmRole.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/roles/", response_model=PmRoleResponse, status_code=201)
async def create_role(
    body: PmRoleCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRoleResponse:
    obj = PmRole(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/roles/{item_id}", response_model=PmRoleResponse)
async def get_role(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmRoleResponse:
    return await _get_or_404(db, PmRole, item_id)


@router.put("/roles/{item_id}", response_model=PmRoleResponse)
async def update_role(
    item_id: int,
    body: PmRoleUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRoleResponse:
    obj = await _get_or_404(db, PmRole, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/roles/{item_id}", status_code=204)
async def delete_role(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmRole, item_id)
    await db.delete(obj)


@router.get("/roles/{item_id}/usage")
async def role_usage(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> dict:
    from app.models.processes import PmDomain, PmProcess, PmActivity
    from sqlalchemy import func

    domain_count = (
        await db.execute(
            select(func.count()).select_from(PmDomain).where(PmDomain.owner_role_id == item_id)
        )
    ).scalar_one()
    process_count = (
        await db.execute(
            select(func.count()).select_from(PmProcess).where(PmProcess.owner_role_id == item_id)
        )
    ).scalar_one()
    return {"role_id": item_id, "domain_count": domain_count, "process_count": process_count}


# ─── Systems ──────────────────────────────────────────────────────────────────


@router.get("/systems/", response_model=list[PmSystemResponse])
async def list_systems(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmSystemResponse]:
    stmt = select(PmSystem).order_by(PmSystem.name)
    if q:
        stmt = stmt.where(PmSystem.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/systems/", response_model=PmSystemResponse, status_code=201)
async def create_system(
    body: PmSystemCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmSystemResponse:
    obj = PmSystem(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/systems/{item_id}", response_model=PmSystemResponse)
async def get_system(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmSystemResponse:
    return await _get_or_404(db, PmSystem, item_id)


@router.put("/systems/{item_id}", response_model=PmSystemResponse)
async def update_system(
    item_id: int,
    body: PmSystemUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmSystemResponse:
    obj = await _get_or_404(db, PmSystem, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/systems/{item_id}", status_code=204)
async def delete_system(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmSystem, item_id)
    await db.delete(obj)


@router.get("/systems/{item_id}/usage")
async def system_usage(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> dict:
    from app.models.processes import PmProcessSystem
    from sqlalchemy import func

    count = (
        await db.execute(
            select(func.count())
            .select_from(PmProcessSystem)
            .where(PmProcessSystem.system_id == item_id)
        )
    ).scalar_one()
    return {"system_id": item_id, "process_count": count}


# ─── Regulations ──────────────────────────────────────────────────────────────


@router.get("/regulations/", response_model=list[PmRegulationResponse])
async def list_regulations(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmRegulationResponse]:
    stmt = select(PmRegulation).order_by(PmRegulation.name)
    if q:
        stmt = stmt.where(PmRegulation.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/regulations/", response_model=PmRegulationResponse, status_code=201)
async def create_regulation(
    body: PmRegulationCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRegulationResponse:
    obj = PmRegulation(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/regulations/{item_id}", response_model=PmRegulationResponse)
async def get_regulation(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmRegulationResponse:
    return await _get_or_404(db, PmRegulation, item_id)


@router.put("/regulations/{item_id}", response_model=PmRegulationResponse)
async def update_regulation(
    item_id: int,
    body: PmRegulationUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRegulationResponse:
    obj = await _get_or_404(db, PmRegulation, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/regulations/{item_id}", status_code=204)
async def delete_regulation(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmRegulation, item_id)
    await db.delete(obj)


# ─── Policies ─────────────────────────────────────────────────────────────────


@router.get("/policies/", response_model=list[PmPolicyResponse])
async def list_policies(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmPolicyResponse]:
    stmt = select(PmPolicy).order_by(PmPolicy.name)
    if q:
        stmt = stmt.where(PmPolicy.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/policies/", response_model=PmPolicyResponse, status_code=201)
async def create_policy(
    body: PmPolicyCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmPolicyResponse:
    obj = PmPolicy(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/policies/{item_id}", response_model=PmPolicyResponse)
async def get_policy(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmPolicyResponse:
    return await _get_or_404(db, PmPolicy, item_id)


@router.put("/policies/{item_id}", response_model=PmPolicyResponse)
async def update_policy(
    item_id: int,
    body: PmPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmPolicyResponse:
    obj = await _get_or_404(db, PmPolicy, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/policies/{item_id}", status_code=204)
async def delete_policy(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmPolicy, item_id)
    await db.delete(obj)


# ─── Risks ────────────────────────────────────────────────────────────────────


@router.get("/risks/", response_model=list[PmRiskResponse])
async def list_risks(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmRiskResponse]:
    stmt = select(PmRisk).order_by(PmRisk.name)
    if q:
        stmt = stmt.where(PmRisk.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/risks/", response_model=PmRiskResponse, status_code=201)
async def create_risk(
    body: PmRiskCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRiskResponse:
    obj = PmRisk(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/risks/{item_id}", response_model=PmRiskResponse)
async def get_risk(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmRiskResponse:
    return await _get_or_404(db, PmRisk, item_id)


@router.put("/risks/{item_id}", response_model=PmRiskResponse)
async def update_risk(
    item_id: int,
    body: PmRiskUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmRiskResponse:
    obj = await _get_or_404(db, PmRisk, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/risks/{item_id}", status_code=204)
async def delete_risk(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmRisk, item_id)
    await db.delete(obj)


# ─── Doc Types ────────────────────────────────────────────────────────────────


@router.get("/doc-types/", response_model=list[PmDocTypeResponse])
async def list_doc_types(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmDocTypeResponse]:
    stmt = select(PmDocType).order_by(PmDocType.name)
    if q:
        stmt = stmt.where(PmDocType.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/doc-types/", response_model=PmDocTypeResponse, status_code=201)
async def create_doc_type(
    body: PmDocTypeCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmDocTypeResponse:
    obj = PmDocType(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/doc-types/{item_id}", response_model=PmDocTypeResponse)
async def get_doc_type(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmDocTypeResponse:
    return await _get_or_404(db, PmDocType, item_id)


@router.put("/doc-types/{item_id}", response_model=PmDocTypeResponse)
async def update_doc_type(
    item_id: int,
    body: PmDocTypeUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmDocTypeResponse:
    obj = await _get_or_404(db, PmDocType, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/doc-types/{item_id}", status_code=204)
async def delete_doc_type(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmDocType, item_id)
    await db.delete(obj)


# ─── Business Units ───────────────────────────────────────────────────────────


@router.get("/business-units/", response_model=list[PmBusinessUnitResponse])
async def list_business_units(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmBusinessUnitResponse]:
    stmt = select(PmBusinessUnit).order_by(PmBusinessUnit.name)
    if q:
        stmt = stmt.where(PmBusinessUnit.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/business-units/", response_model=PmBusinessUnitResponse, status_code=201)
async def create_business_unit(
    body: PmBusinessUnitCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmBusinessUnitResponse:
    obj = PmBusinessUnit(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.get("/business-units/{item_id}", response_model=PmBusinessUnitResponse)
async def get_business_unit(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmBusinessUnitResponse:
    return await _get_or_404(db, PmBusinessUnit, item_id)


@router.put("/business-units/{item_id}", response_model=PmBusinessUnitResponse)
async def update_business_unit(
    item_id: int,
    body: PmBusinessUnitUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmBusinessUnitResponse:
    obj = await _get_or_404(db, PmBusinessUnit, item_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return obj


@router.delete("/business-units/{item_id}", status_code=204)
async def delete_business_unit(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, PmBusinessUnit, item_id)
    await db.delete(obj)
