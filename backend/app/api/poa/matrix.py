from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import (
    AuditAction,
    Authority,
    AuthorityGrant,
    OrgLevel,
    OrgScope,
    ResolvedGrant,
)
from app.models.user import UserRole
from app.schemas.poa import (
    AuthorityGrantResponse,
    MatrixCellUpsert,
    RegenerateResponse,
    ResolvedGrantResponse,
)
from app.services.poa.audit import snapshot, write_audit
from app.services.poa.resolver import regenerate_resolved_grants

router = APIRouter(prefix="/matrix", tags=["poa-matrix"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))

_GRANT_FIELDS = [
    "authority_id", "org_scope_id", "org_level_id", "granted",
    "limit_override", "no_limit", "sub_delegation_only",
]


async def _validate_refs(db: AsyncSession, body: MatrixCellUpsert) -> None:
    if (
        await db.execute(select(Authority.id).where(Authority.id == body.authority_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Полномочие не найдено")
    if (
        await db.execute(select(OrgLevel.id).where(OrgLevel.id == body.org_level_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Уровень не найден")
    if body.org_scope_id is not None and (
        await db.execute(select(OrgScope.id).where(OrgScope.id == body.org_scope_id))
    ).scalar_one_or_none() is None:
        raise HTTPException(status_code=400, detail="Орг-скоуп не найден")


def _cell_query(authority_id: int, org_level_id: int, org_scope_id: int | None):
    stmt = select(AuthorityGrant).where(
        AuthorityGrant.authority_id == authority_id,
        AuthorityGrant.org_level_id == org_level_id,
    )
    if org_scope_id is None:
        return stmt.where(AuthorityGrant.org_scope_id.is_(None))
    return stmt.where(AuthorityGrant.org_scope_id == org_scope_id)


@router.get("/", response_model=list[AuthorityGrantResponse])
async def list_matrix(
    authority_id: int | None = None,
    org_scope_id: int | None = None,
    org_level_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[AuthorityGrant]:
    stmt = select(AuthorityGrant)
    if authority_id is not None:
        stmt = stmt.where(AuthorityGrant.authority_id == authority_id)
    if org_scope_id is not None:
        stmt = stmt.where(AuthorityGrant.org_scope_id == org_scope_id)
    if org_level_id is not None:
        stmt = stmt.where(AuthorityGrant.org_level_id == org_level_id)
    result = await db.execute(
        stmt.order_by(
            AuthorityGrant.authority_id, AuthorityGrant.org_level_id, AuthorityGrant.org_scope_id
        )
    )
    return result.scalars().all()


@router.get("/resolved", response_model=list[ResolvedGrantResponse])
async def list_resolved(
    authority_id: int | None = None,
    org_scope_id: int | None = None,
    org_level_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> list[ResolvedGrant]:
    stmt = select(ResolvedGrant)
    if authority_id is not None:
        stmt = stmt.where(ResolvedGrant.authority_id == authority_id)
    if org_scope_id is not None:
        stmt = stmt.where(ResolvedGrant.org_scope_id == org_scope_id)
    if org_level_id is not None:
        stmt = stmt.where(ResolvedGrant.org_level_id == org_level_id)
    result = await db.execute(
        stmt.order_by(
            ResolvedGrant.org_scope_id, ResolvedGrant.org_level_id, ResolvedGrant.authority_id
        )
    )
    return result.scalars().all()


@router.put("/cell", response_model=AuthorityGrantResponse)
async def upsert_cell(
    body: MatrixCellUpsert,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> AuthorityGrant:
    await _validate_refs(db, body)
    existing = (
        await db.execute(_cell_query(body.authority_id, body.org_level_id, body.org_scope_id))
    ).scalar_one_or_none()

    if existing is None:
        obj = AuthorityGrant(**body.model_dump())
        db.add(obj)
        await db.flush()
        await db.refresh(obj)
        await write_audit(
            db, entity_type="authority_grant", entity_id=obj.id,
            action=AuditAction.create, user_id=user.id,
            after=snapshot(obj, _GRANT_FIELDS),
        )
    else:
        before = snapshot(existing, _GRANT_FIELDS)
        for key, val in body.model_dump().items():
            setattr(existing, key, val)
        await db.flush()
        await db.refresh(existing)
        obj = existing
        await write_audit(
            db, entity_type="authority_grant", entity_id=obj.id,
            action=AuditAction.update, user_id=user.id,
            before=before, after=snapshot(obj, _GRANT_FIELDS),
        )

    await regenerate_resolved_grants(db)
    return obj


@router.delete("/cell", status_code=204)
async def delete_cell(
    authority_id: int,
    org_level_id: int,
    org_scope_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> Response:
    obj = (
        await db.execute(_cell_query(authority_id, org_level_id, org_scope_id))
    ).scalar_one_or_none()
    if obj is None:
        raise HTTPException(status_code=404, detail="Ячейка матрицы не найдена")
    await write_audit(
        db, entity_type="authority_grant", entity_id=obj.id,
        action=AuditAction.delete, user_id=user.id,
        before=snapshot(obj, _GRANT_FIELDS),
    )
    await db.delete(obj)
    await db.flush()
    await regenerate_resolved_grants(db)
    return Response(status_code=204)


@router.post("/regenerate", response_model=RegenerateResponse)
async def regenerate(
    db: AsyncSession = Depends(get_db),
    user: UserContext = _LAWYER,
) -> RegenerateResponse:
    count = await regenerate_resolved_grants(db)
    await write_audit(
        db, entity_type="resolved_grant", entity_id=None,
        action=AuditAction.generate, user_id=user.id,
        after={"resolved_count": count},
    )
    return RegenerateResponse(resolved_count=count)
