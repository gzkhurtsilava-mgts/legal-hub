from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, get_current_user
from app.models.processes import PmDomain, PmProcess
from app.schemas.processes import PmLandscapeDomain, PmLandscapeResponse

router = APIRouter(tags=["processes-utils"])

_AUTH = Depends(get_current_user)


@router.get("/landscape", response_model=PmLandscapeResponse)
async def get_landscape(
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> PmLandscapeResponse:
    domains_result = await db.execute(select(PmDomain).order_by(PmDomain.name))
    domains = domains_result.scalars().all()

    # Count processes per domain and type in one query
    counts_result = await db.execute(
        select(PmProcess.domain_id, PmProcess.type, func.count().label("cnt")).group_by(
            PmProcess.domain_id, PmProcess.type
        )
    )
    counts = counts_result.all()

    counts_map: dict[str, dict] = {}
    for row in counts:
        if row.domain_id not in counts_map:
            counts_map[row.domain_id] = {"workflow": 0, "service": 0}
        counts_map[row.domain_id][row.type.value] += row.cnt

    landscape_domains = []
    total_processes = 0
    for d in domains:
        wf = counts_map.get(d.id, {}).get("workflow", 0)
        sv = counts_map.get(d.id, {}).get("service", 0)
        total = wf + sv
        total_processes += total
        landscape_domains.append(
            PmLandscapeDomain(
                id=d.id,
                name=d.name,
                mission=d.mission,
                workflow_count=wf,
                service_count=sv,
                process_count=total,
            )
        )

    return PmLandscapeResponse(
        domains=landscape_domains,
        total_domains=len(domains),
        total_processes=total_processes,
    )


@router.get("/next-id")
async def next_id(
    domain: str = Query(..., description="Domain code, e.g. CONTRACT"),
    type: str = Query(..., description="workflow or service"),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> dict:
    prefix_char = "W" if type == "workflow" else "S"
    prefix = f"LEG.{domain.upper()}.{prefix_char}."

    result = await db.execute(
        select(PmProcess.id)
        .where(PmProcess.id.like(f"{prefix}%"))
        .order_by(PmProcess.id.desc())
    )
    existing = result.scalars().all()

    if not existing:
        next_num = 1
    else:
        nums = []
        for pid in existing:
            try:
                nums.append(int(pid.split(".")[-1]))
            except ValueError:
                pass
        next_num = (max(nums) + 1) if nums else 1

    return {"suggested_id": f"{prefix}{next_num:03d}"}


@router.get("/next-activity-id")
async def next_activity_id(
    process_id: str = Query(...),
    optional: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: UserContext = _AUTH,
) -> dict:
    from app.models.processes import PmActivity, PmProcessType

    proc_result = await db.execute(select(PmProcess).where(PmProcess.id == process_id))
    proc = proc_result.scalar_one_or_none()

    acts_result = await db.execute(
        select(PmActivity.id).where(PmActivity.parent_process_id == process_id)
    )
    existing_ids = acts_result.scalars().all()

    if proc and proc.type == PmProcessType.workflow:
        prefix = f"{process_id}.A"
        nums = []
        for aid in existing_ids:
            suffix = aid.replace(f"{process_id}.A", "")
            try:
                nums.append(int(suffix))
            except ValueError:
                pass
        next_num = (max(nums) + 1) if nums else 1
        suggested = f"{prefix}{next_num}"
    else:
        # Service: MA (mandatory) or OA (optional)
        tag = "OA" if optional else "MA"
        prefix = f"{process_id}.{tag}"
        nums = []
        for aid in existing_ids:
            if aid.startswith(prefix):
                suffix = aid.replace(prefix, "")
                try:
                    nums.append(int(suffix))
                except ValueError:
                    pass
        next_num = (max(nums) + 1) if nums else 1
        suggested = f"{prefix}{next_num}"

    return {"suggested_id": suggested}
