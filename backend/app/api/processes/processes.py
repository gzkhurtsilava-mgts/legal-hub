from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user, require_role
from app.models.processes import (
    PmActivity,
    PmAutomationCandidate,
    PmBusinessUnit,
    PmProcess,
    PmProcessBusinessUnit,
    PmProcessMetric,
    PmProcessRaci,
    PmProcessRegulation,
    PmProcessRisk,
    PmProcessSystem,
    PmRegulation,
    PmRole,
    PmRisk,
    PmStatus,
    PmSystem,
)
from app.models.user import UserRole
from app.schemas.processes import (
    PmAutomationCandidateIn,
    PmAutomationCandidateOut,
    PmBuAssignmentIn,
    PmBuAssignmentOut,
    PmMetricIn,
    PmMetricOut,
    PmProcessCreate,
    PmProcessDetail,
    PmProcessListItem,
    PmProcessUpdate,
    PmRaciRowIn,
    PmRaciRowOut,
    PmRegulationAssignmentIn,
    PmRegulationAssignmentOut,
    PmRiskAssignmentIn,
    PmRiskAssignmentOut,
    PmSystemAssignmentIn,
    PmSystemAssignmentOut,
)

router = APIRouter(tags=["processes-l3"])

_EDITOR = Depends(require_role(UserRole.admin, UserRole.lawyer))
_AUTH = Depends(get_current_user)


async def _get_or_404(db: AsyncSession, process_id: str) -> PmProcess:
    result = await db.execute(select(PmProcess).where(PmProcess.id == process_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Процесс не найден")
    return obj


async def _fetch_detail(db: AsyncSession, proc: PmProcess) -> PmProcessDetail:
    pid = proc.id

    bu_rows = (
        await db.execute(
            select(PmProcessBusinessUnit, PmBusinessUnit)
            .join(PmBusinessUnit, PmBusinessUnit.id == PmProcessBusinessUnit.bu_id)
            .where(PmProcessBusinessUnit.process_id == pid)
        )
    ).all()
    bus = [
        PmBuAssignmentOut(
            bu_id=r.PmBusinessUnit.id,
            bu_name=r.PmBusinessUnit.name,
            bu_type=r.PmBusinessUnit.type,
            notes=r.PmProcessBusinessUnit.notes,
        )
        for r in bu_rows
    ]

    sys_rows = (
        await db.execute(
            select(PmProcessSystem, PmSystem)
            .join(PmSystem, PmSystem.id == PmProcessSystem.system_id)
            .where(PmProcessSystem.process_id == pid)
        )
    ).all()
    systems = [
        PmSystemAssignmentOut(system_id=r.PmSystem.id, system_name=r.PmSystem.name)
        for r in sys_rows
    ]

    reg_rows = (
        await db.execute(
            select(PmProcessRegulation, PmRegulation)
            .join(PmRegulation, PmRegulation.id == PmProcessRegulation.reg_id)
            .where(PmProcessRegulation.process_id == pid)
        )
    ).all()
    regulations = [
        PmRegulationAssignmentOut(
            reg_id=r.PmRegulation.id,
            reg_name=r.PmRegulation.name,
            articles=r.PmProcessRegulation.articles,
            relevance_note=r.PmProcessRegulation.relevance_note,
        )
        for r in reg_rows
    ]

    risk_rows = (
        await db.execute(
            select(PmProcessRisk, PmRisk)
            .join(PmRisk, PmRisk.id == PmProcessRisk.risk_id)
            .where(PmProcessRisk.process_id == pid)
        )
    ).all()
    risks = [
        PmRiskAssignmentOut(
            risk_id=r.PmRisk.id,
            risk_name=r.PmRisk.name,
            impact=r.PmProcessRisk.impact,
            probability=r.PmProcessRisk.probability,
            control=r.PmProcessRisk.control,
        )
        for r in risk_rows
    ]

    raci_rows = (
        await db.execute(
            select(PmProcessRaci, PmRole)
            .join(PmRole, PmRole.id == PmProcessRaci.role_id)
            .where(PmProcessRaci.process_id == pid)
        )
    ).all()
    raci = [
        PmRaciRowOut(
            role_id=r.PmRole.id,
            role_name=r.PmRole.name,
            activity_id=r.PmProcessRaci.activity_id,
            r=r.PmProcessRaci.r,
            a=r.PmProcessRaci.a,
            c=r.PmProcessRaci.c,
            i=r.PmProcessRaci.i,
        )
        for r in raci_rows
    ]

    metric_rows = (
        await db.execute(
            select(PmProcessMetric).where(PmProcessMetric.process_id == pid)
        )
    ).scalars().all()
    metrics = [PmMetricOut.model_validate(m) for m in metric_rows]

    ac_rows = (
        await db.execute(
            select(PmAutomationCandidate).where(PmAutomationCandidate.process_id == pid)
        )
    ).scalars().all()
    auto_cands = [PmAutomationCandidateOut.model_validate(a) for a in ac_rows]

    act_count = (
        await db.execute(
            select(func.count()).select_from(PmActivity).where(PmActivity.parent_process_id == pid)
        )
    ).scalar_one()

    detail = PmProcessDetail.model_validate(proc)
    detail.business_units = bus
    detail.systems = systems
    detail.regulations = regulations
    detail.risks = risks
    detail.raci = raci
    detail.metrics = metrics
    detail.automation_candidates = auto_cands
    detail.activity_count = act_count
    return detail


# ─── CRUD ─────────────────────────────────────────────────────────────────────


@router.get("/", response_model=list[PmProcessListItem])
async def list_processes(
    domain_id: str | None = Query(None),
    type: str | None = Query(None),
    status: str | None = Query(None),
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> list[PmProcessListItem]:
    stmt = select(PmProcess)
    if domain_id:
        stmt = stmt.where(PmProcess.domain_id == domain_id)
    if type:
        stmt = stmt.where(PmProcess.type == type)
    if status:
        stmt = stmt.where(PmProcess.status == status)
    if q:
        stmt = stmt.where(PmProcess.name.ilike(f"%{q}%"))
    stmt = stmt.order_by(PmProcess.domain_id, PmProcess.type, PmProcess.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=PmProcessDetail, status_code=201)
async def create_process(
    body: PmProcessCreate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmProcessDetail:
    existing = await db.execute(select(PmProcess).where(PmProcess.id == body.id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"Процесс с ID '{body.id}' уже существует")
    obj = PmProcess(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return await _fetch_detail(db, obj)


@router.get("/{process_id}", response_model=PmProcessDetail)
async def get_process(
    process_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmProcessDetail:
    obj = await _get_or_404(db, process_id)
    return await _fetch_detail(db, obj)


@router.put("/{process_id}", response_model=PmProcessDetail)
async def update_process(
    process_id: str,
    body: PmProcessUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmProcessDetail:
    obj = await _get_or_404(db, process_id)
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(obj, key, val)
    await db.flush()
    await db.refresh(obj)
    return await _fetch_detail(db, obj)


@router.delete("/{process_id}", status_code=204)
async def delete_process(
    process_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> None:
    obj = await _get_or_404(db, process_id)
    act_count = (
        await db.execute(
            select(func.count()).select_from(PmActivity).where(
                PmActivity.parent_process_id == process_id
            )
        )
    ).scalar_one()
    if act_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Невозможно удалить: процесс содержит {act_count} активностей",
        )
    await db.delete(obj)


# ─── Junction endpoints ────────────────────────────────────────────────────────


@router.put("/{process_id}/business-units")
async def update_business_units(
    process_id: str,
    body: list[PmBuAssignmentIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessBusinessUnit).where(PmProcessBusinessUnit.process_id == process_id)
    )
    for item in body:
        db.add(PmProcessBusinessUnit(process_id=process_id, bu_id=item.bu_id, notes=item.notes))
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/systems")
async def update_systems(
    process_id: str,
    body: list[PmSystemAssignmentIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessSystem).where(PmProcessSystem.process_id == process_id)
    )
    for item in body:
        db.add(PmProcessSystem(process_id=process_id, system_id=item.system_id))
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/regulations")
async def update_regulations(
    process_id: str,
    body: list[PmRegulationAssignmentIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessRegulation).where(PmProcessRegulation.process_id == process_id)
    )
    for item in body:
        db.add(
            PmProcessRegulation(
                process_id=process_id,
                reg_id=item.reg_id,
                articles=item.articles,
                relevance_note=item.relevance_note,
            )
        )
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/risks")
async def update_risks(
    process_id: str,
    body: list[PmRiskAssignmentIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessRisk).where(PmProcessRisk.process_id == process_id)
    )
    for item in body:
        db.add(
            PmProcessRisk(
                process_id=process_id,
                risk_id=item.risk_id,
                impact=item.impact,
                probability=item.probability,
                control=item.control,
            )
        )
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/raci")
async def update_raci(
    process_id: str,
    body: list[PmRaciRowIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessRaci).where(PmProcessRaci.process_id == process_id)
    )
    for item in body:
        db.add(
            PmProcessRaci(
                process_id=process_id,
                role_id=item.role_id,
                activity_id=item.activity_id,
                r=item.r,
                a=item.a,
                c=item.c,
                i=item.i,
            )
        )
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/metrics")
async def update_metrics(
    process_id: str,
    body: list[PmMetricIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmProcessMetric).where(PmProcessMetric.process_id == process_id)
    )
    for item in body:
        db.add(
            PmProcessMetric(
                process_id=process_id,
                name=item.name,
                value=item.value,
                unit=item.unit,
                metric_status=item.metric_status,
            )
        )
    await db.flush()
    return {"ok": True}


@router.put("/{process_id}/automation-candidates")
async def update_automation_candidates(
    process_id: str,
    body: list[PmAutomationCandidateIn],
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> dict:
    await _get_or_404(db, process_id)
    await db.execute(
        delete(PmAutomationCandidate).where(PmAutomationCandidate.process_id == process_id)
    )
    for item in body:
        db.add(
            PmAutomationCandidate(
                process_id=process_id,
                idea=item.idea,
                impact=item.impact,
                effort=item.effort,
                score=item.score,
            )
        )
    await db.flush()
    return {"ok": True}


# ─── Lifecycle ────────────────────────────────────────────────────────────────


@router.post("/{process_id}/create-to-be", response_model=PmProcessDetail, status_code=201)
async def create_to_be(
    process_id: str,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _EDITOR,
) -> PmProcessDetail:
    src = await _get_or_404(db, process_id)

    raw_new_id = f"{process_id}.TB1"
    new_id = raw_new_id if len(raw_new_id) <= 40 else process_id[:36] + ".TB1"

    existing = await db.execute(select(PmProcess).where(PmProcess.id == new_id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail=f"To-be версия '{new_id}' уже существует")

    new_proc = PmProcess(
        id=new_id,
        name=src.name,
        type=src.type,
        domain_id=src.domain_id,
        owner_role_id=src.owner_role_id,
        version="1.0",
        status=PmStatus.to_be,
        lifecycle_ref_id=process_id,
        last_updated=src.last_updated,
        next_review=src.next_review,
        sirporc=src.sirporc,
        bu_mode=src.bu_mode,
        connections=[],
        changelog=[],
        sla_days=src.sla_days,
        pain_points=src.pain_points,
        required_competencies=src.required_competencies,
        effort_estimation=src.effort_estimation,
        decision_points=src.decision_points,
        case_library=src.case_library,
        improvement_candidates=src.improvement_candidates,
    )
    db.add(new_proc)
    await db.flush()

    src_detail = await _fetch_detail(db, src)
    for bu in src_detail.business_units:
        db.add(PmProcessBusinessUnit(process_id=new_id, bu_id=bu.bu_id, notes=bu.notes))
    for s in src_detail.systems:
        db.add(PmProcessSystem(process_id=new_id, system_id=s.system_id))
    for reg in src_detail.regulations:
        db.add(
            PmProcessRegulation(
                process_id=new_id,
                reg_id=reg.reg_id,
                articles=reg.articles,
                relevance_note=reg.relevance_note,
            )
        )
    for risk in src_detail.risks:
        db.add(
            PmProcessRisk(
                process_id=new_id,
                risk_id=risk.risk_id,
                impact=risk.impact,
                probability=risk.probability,
                control=risk.control,
            )
        )
    for raci in src_detail.raci:
        db.add(
            PmProcessRaci(
                process_id=new_id,
                role_id=raci.role_id,
                activity_id=None,
                r=raci.r,
                a=raci.a,
                c=raci.c,
                i=raci.i,
            )
        )
    for metric in src_detail.metrics:
        db.add(
            PmProcessMetric(
                process_id=new_id,
                name=metric.name,
                value=metric.value,
                unit=metric.unit,
                metric_status=metric.metric_status,
            )
        )
    for ac in src_detail.automation_candidates:
        db.add(
            PmAutomationCandidate(
                process_id=new_id,
                idea=ac.idea,
                impact=ac.impact,
                effort=ac.effort,
                score=ac.score,
            )
        )

    await db.flush()
    await db.refresh(new_proc)
    return await _fetch_detail(db, new_proc)
