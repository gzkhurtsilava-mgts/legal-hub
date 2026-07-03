from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Authority
from app.models.user import UserRole
from app.schemas.poa import RenderRequest
from app.services.poa.constructor import (
    DOCX_MIME,
    convert_to_pdf,
    list_templates,
    render_docx,
)

router = APIRouter(prefix="/documents", tags=["poa-documents"])

_LAWYER = Depends(require_role(UserRole.admin, UserRole.lawyer))


@router.get("/templates", response_model=list[str])
async def templates(_: UserContext = _LAWYER) -> list[str]:
    return list_templates()


@router.post("/render")
async def render(
    body: RenderRequest,
    db: AsyncSession = Depends(get_db),
    _: UserContext = _LAWYER,
) -> Response:
    # Тексты полномочий из каталога — в порядке, выбранном пользователем.
    texts: list[str] = []
    if body.authority_ids:
        rows = (
            await db.execute(select(Authority).where(Authority.id.in_(body.authority_ids)))
        ).scalars().all()
        by_id = {a.id: a for a in rows}
        missing = [i for i in body.authority_ids if i not in by_id]
        if missing:
            raise HTTPException(status_code=400, detail=f"Полномочия не найдены: {missing}")
        texts = [by_id[i].text_full for i in body.authority_ids]

    context = {
        "grantee_fio": body.grantee_fio,
        "grantee_passport": body.grantee_passport,
        "validity": body.validity,
        "authorities": texts,
    }
    try:
        docx = render_docx(body.template, context)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if body.output == "pdf":
        try:
            pdf = await convert_to_pdf(docx)
        except Exception:
            raise HTTPException(status_code=502, detail="Конвертер PDF недоступен")
        return _file_response(pdf, "application/pdf", "doverennost.pdf")
    return _file_response(docx, DOCX_MIME, "doverennost.docx")


def _file_response(content: bytes, media_type: str, filename: str) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}; "
            f"filename*=UTF-8''{quote(filename)}"
        },
    )
