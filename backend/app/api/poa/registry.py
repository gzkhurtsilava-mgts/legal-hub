from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import (
    AuditAction,
    Authority,
    CertificateStatus,
    PoaCertificate,
    PoaOriginalIssue,
)
from app.models.poa import poa_certificate_authorities as cert_auth
from app.models.user import UserRole
from app.schemas.poa import (
    CertificateCreate,
    CertificateResponse,
    CertificateUpdate,
    OriginalIssueCreate,
    OriginalIssueResponse,
)
from app.services.poa.audit import snapshot, write_audit

router = APIRouter(prefix="/registry", tags=["poa-registry"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))

_CERT_FIELDS = [
    "number", "grantor_company", "grantee_fio", "cert_type",
    "issued_date", "valid_to", "status",
]


async def _expire_overdue(db: AsyncSession) -> None:
    """Авто-`expired`: доверенности с истёкшим сроком переводятся из active."""
    await db.execute(
        update(PoaCertificate)
        .where(
            PoaCertificate.status == CertificateStatus.active,
            PoaCertificate.valid_to.is_not(None),
            PoaCertificate.valid_to < date.today(),
        )
        .values(status=CertificateStatus.expired)
    )


async def _get_full(db: AsyncSession, cert_id: int) -> PoaCertificate | None:
    return (
        await db.execute(
            select(PoaCertificate)
            .options(selectinload(PoaCertificate.authorities))
            .where(PoaCertificate.id == cert_id)
        )
    ).scalar_one_or_none()


async def _get_or_404(db: AsyncSession, cert_id: int) -> PoaCertificate:
    obj = await _get_full(db, cert_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Доверенность не найдена")
    return obj


async def _load_authorities(db: AsyncSession, ids: list[int]) -> list[Authority]:
    if not ids:
        return []
    auths = (
        await db.execute(select(Authority).where(Authority.id.in_(ids)))
    ).scalars().all()
    if len(auths) != len(set(ids)):
        raise HTTPException(status_code=400, detail="Некоторые полномочия не найдены")
    return list(auths)


@router.get("/", response_model=list[CertificateResponse])
async def list_registry(
    status: CertificateStatus | None = None,
    company: str | None = None,
    grantee_employee_id: int | None = None,
    authority_id: int | None = None,
    q: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[PoaCertificate]:
    await _expire_overdue(db)
    stmt = select(PoaCertificate).options(selectinload(PoaCertificate.authorities))
    if authority_id is not None:  # срез «кто имеет полномочие X»
        stmt = stmt.join(
            cert_auth, cert_auth.c.certificate_id == PoaCertificate.id
        ).where(cert_auth.c.authority_id == authority_id)
    if status is not None:
        stmt = stmt.where(PoaCertificate.status == status)
    if company is not None:
        stmt = stmt.where(PoaCertificate.grantor_company == company)
    if grantee_employee_id is not None:
        stmt = stmt.where(PoaCertificate.grantee_employee_id == grantee_employee_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(PoaCertificate.number.ilike(like), PoaCertificate.grantee_fio.ilike(like))
        )
    result = await db.execute(stmt.order_by(PoaCertificate.issued_date.desc()))
    return result.scalars().all()


@router.post("/", response_model=CertificateResponse, status_code=201)
async def create_certificate(
    body: CertificateCreate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> PoaCertificate:
    exists = (
        await db.execute(select(PoaCertificate.id).where(PoaCertificate.number == body.number))
    ).scalar_one_or_none()
    if exists is not None:
        raise HTTPException(status_code=409, detail=f"Доверенность № {body.number} уже есть")
    data = body.model_dump(exclude={"authority_ids"})
    authorities = await _load_authorities(db, body.authority_ids)
    obj = PoaCertificate(**data)
    obj.authorities = authorities
    db.add(obj)
    await db.flush()
    await write_audit(
        db, entity_type="certificate", entity_id=obj.id,
        action=AuditAction.create, user_id=user.id, after=snapshot(obj, _CERT_FIELDS),
    )
    return await _get_full(db, obj.id)


@router.get("/{cert_id}", response_model=CertificateResponse)
async def get_certificate(
    cert_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> PoaCertificate:
    await _expire_overdue(db)
    return await _get_or_404(db, cert_id)


@router.put("/{cert_id}", response_model=CertificateResponse)
async def update_certificate(
    cert_id: int,
    body: CertificateUpdate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> PoaCertificate:
    obj = await _get_or_404(db, cert_id)
    before = snapshot(obj, _CERT_FIELDS)
    data = body.model_dump(exclude_unset=True)
    authority_ids = data.pop("authority_ids", None)
    for key, val in data.items():
        setattr(obj, key, val)
    if authority_ids is not None:
        obj.authorities = await _load_authorities(db, authority_ids)
    await db.flush()
    await write_audit(
        db, entity_type="certificate", entity_id=obj.id,
        action=AuditAction.update, user_id=user.id,
        before=before, after=snapshot(obj, _CERT_FIELDS),
    )
    return await _get_full(db, obj.id)


@router.post("/{cert_id}/revoke", response_model=CertificateResponse)
async def revoke_certificate(
    cert_id: int,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> PoaCertificate:
    obj = await _get_or_404(db, cert_id)
    if obj.status == CertificateStatus.revoked:
        raise HTTPException(status_code=409, detail="Доверенность уже отозвана")
    before = snapshot(obj, _CERT_FIELDS)
    obj.status = CertificateStatus.revoked
    await db.flush()
    await write_audit(
        db, entity_type="certificate", entity_id=obj.id,
        action=AuditAction.update, user_id=user.id,
        before=before, after=snapshot(obj, _CERT_FIELDS),
    )
    return await _get_full(db, obj.id)


@router.get("/{cert_id}/original-issues", response_model=list[OriginalIssueResponse])
async def list_original_issues(
    cert_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[PoaOriginalIssue]:
    await _get_or_404(db, cert_id)
    result = await db.execute(
        select(PoaOriginalIssue)
        .where(PoaOriginalIssue.certificate_id == cert_id)
        .order_by(PoaOriginalIssue.issued_date)
    )
    return result.scalars().all()


@router.post(
    "/{cert_id}/original-issue", response_model=OriginalIssueResponse, status_code=201
)
async def add_original_issue(
    cert_id: int,
    body: OriginalIssueCreate,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> PoaOriginalIssue:
    await _get_or_404(db, cert_id)
    obj = PoaOriginalIssue(certificate_id=cert_id, **body.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    await write_audit(
        db, entity_type="original_issue", entity_id=obj.id,
        action=AuditAction.create, user_id=user.id,
        after={"certificate_id": cert_id, "recipient_fio": obj.recipient_fio,
               "method": obj.method.value},
    )
    return obj
