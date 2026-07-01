from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import (
    AuditAction,
    Authority,
    AuthorityRequest,
    Employee,
    RequestStatus,
)
from app.models.user import UserRole
from app.schemas.poa import AuthorityRequestCreate, AuthorityRequestResponse
from app.services.poa.audit import snapshot, write_audit

router = APIRouter(prefix="/authority-requests", tags=["poa-authority-requests"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))

_REQ_FIELDS = ["employee_id", "authority_id", "proposed_text", "status", "approver"]


async def _get_or_404(db: AsyncSession, request_id: int) -> AuthorityRequest:
    result = await db.execute(select(AuthorityRequest).where(AuthorityRequest.id == request_id))
    obj = result.scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return obj


@router.get("/", response_model=list[AuthorityRequestResponse])
async def list_requests(
    status: RequestStatus | None = None,
    employee_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[AuthorityRequest]:
    stmt = select(AuthorityRequest)
    if status is not None:
        stmt = stmt.where(AuthorityRequest.status == status)
    if employee_id is not None:
        stmt = stmt.where(AuthorityRequest.employee_id == employee_id)
    result = await db.execute(stmt.order_by(AuthorityRequest.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=AuthorityRequestResponse, status_code=201)
async def create_request(
    body: AuthorityRequestCreate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> AuthorityRequest:
    if body.authority_id is None and not body.proposed_text:
        raise HTTPException(
            status_code=400, detail="Укажите authority_id или proposed_text"
        )
    if (
        await db.execute(select(Employee.id).where(Employee.id == body.employee_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Сотрудник не найден")
    if body.authority_id is not None and (
        await db.execute(select(Authority.id).where(Authority.id == body.authority_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Полномочие не найдено")

    obj = AuthorityRequest(**body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    await write_audit(
        db, entity_type="authority_request", entity_id=obj.id,
        action=AuditAction.create, user_id=user.id, after=snapshot(obj, _REQ_FIELDS),
    )
    return obj


@router.get("/{request_id}", response_model=AuthorityRequestResponse)
async def get_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> AuthorityRequest:
    return await _get_or_404(db, request_id)


async def _decide(
    db: AsyncSession, request_id: int, user: UserContext,
    new_status: RequestStatus, action: AuditAction,
) -> AuthorityRequest:
    obj = await _get_or_404(db, request_id)
    if obj.status != RequestStatus.pending:
        raise HTTPException(
            status_code=409, detail=f"Заявка уже обработана (статус: {obj.status.value})"
        )
    before = snapshot(obj, _REQ_FIELDS)
    obj.status = new_status
    obj.approver = user.email
    await db.flush()
    await db.refresh(obj)
    await write_audit(
        db, entity_type="authority_request", entity_id=obj.id,
        action=action, user_id=user.id, before=before, after=snapshot(obj, _REQ_FIELDS),
    )
    return obj


@router.post("/{request_id}/approve", response_model=AuthorityRequestResponse)
async def approve_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> AuthorityRequest:
    return await _decide(db, request_id, user, RequestStatus.approved, AuditAction.approve)


@router.post("/{request_id}/reject", response_model=AuthorityRequestResponse)
async def reject_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> AuthorityRequest:
    return await _decide(db, request_id, user, RequestStatus.rejected, AuditAction.reject)
