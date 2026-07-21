from urllib.parse import quote

from docxtpl import RichText
from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import UserContext, require_role
from app.models.poa import Authority
from app.models.user import UserRole
from app.schemas.poa import GranteeIn, RenderRequest
from app.services.poa.constructor import (
    DOCX_MIME,
    convert_to_pdf,
    list_templates,
    render_docx,
)
from app.services.poa.morph import to_accusative

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
    # RichText: явный шрифт Arial + переносы строк для многострочных формулировок
    # (иначе подпункты «1.1., 1.2. …» склеиваются, а вставка идёт шрифтом шаблона).
    authorities: list[RichText] = []
    if body.authority_ids:
        rows = (
            await db.execute(select(Authority).where(Authority.id.in_(body.authority_ids)))
        ).scalars().all()
        by_id = {a.id: a for a in rows}
        missing = [i for i in body.authority_ids if i not in by_id]
        if missing:
            raise HTTPException(status_code=400, detail=f"Полномочия не найдены: {missing}")
        authorities = [_rich(by_id[i].text_full) for i in body.authority_ids]

    # Поверенные: список grantees, иначе одиночные поля (обратная совместимость).
    grantees_in = list(body.grantees)
    if not grantees_in and body.grantee_fio:
        grantees_in = [GranteeIn(fio=body.grantee_fio, passport=body.grantee_passport)]
    grantees_in = [g for g in grantees_in if g.fio.strip()]
    if not grantees_in:
        raise HTTPException(status_code=400, detail="Не указан ни один поверенный")

    # ФИО в теле доверенности — в винительном падеже («…уполномочивает (кого?)
    # Кузнецову Елену Владимировну / Кузнецова Сергея Петровича»).
    grantees = [
        {"fio": to_accusative(g.fio.strip()), "fio_nom": g.fio.strip(), "passport": g.passport}
        for g in grantees_in
    ]

    context = {
        "grantees": grantees,
        # Одиночные плейсхолдеры — на случай старого шаблона без цикла.
        "grantee_fio": grantees[0]["fio"],
        "grantee_passport": grantees[0]["passport"],
        "validity": body.validity,
        "authorities": authorities,
    }
    try:
        # Рендер синхронный (docxtpl) — уводим в threadpool, чтобы не блокировать event loop.
        docx = await run_in_threadpool(render_docx, body.template, context)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if body.output == "pdf":
        try:
            pdf = await convert_to_pdf(docx)
        except Exception:
            raise HTTPException(status_code=502, detail="Конвертер PDF недоступен")
        return _file_response(pdf, "application/pdf", "doverennost.pdf")
    return _file_response(docx, DOCX_MIME, "doverennost.docx")


def _rich(text: str) -> RichText:
    """Текст полномочия как RichText: Arial + перенос строки на каждый \\n."""
    rt = RichText()
    for i, line in enumerate(text.split("\n")):
        if i:
            rt.add("\n")  # docxtpl конвертирует \n внутри add в <w:br/>
        rt.add(line, font="Arial")
    return rt


def _file_response(content: bytes, media_type: str, filename: str) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}; "
            f"filename*=UTF-8''{quote(filename)}"
        },
    )
