"""Модуль «Доверенности» — конструктор документов (Модуль 3).

docxtpl (Jinja2-в-Word): размеченный .docx-шаблон + контекст → готовый .docx
без съехавших стилей. Перечень полномочий тянется из каталога (`authority.text_full`).
Для PDF/МЧД — конвертация через JodConverter (LibreOffice headless REST).
"""

from io import BytesIO
from pathlib import Path

import httpx
from docxtpl import DocxTemplate

from app.core.config import settings

# app/services/poa/constructor.py → app/templates/poa
TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "templates" / "poa"

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def list_templates() -> list[str]:
    """Имена доступных шаблонов (файлы .docx в каталоге шаблонов)."""
    if not TEMPLATES_DIR.exists():
        return []
    return sorted(p.stem for p in TEMPLATES_DIR.glob("*.docx"))


def template_path(name: str) -> Path:
    """Путь к шаблону с защитой от выхода за каталог."""
    path = (TEMPLATES_DIR / f"{name}.docx").resolve()
    if TEMPLATES_DIR.resolve() not in path.parents or not path.exists():
        raise FileNotFoundError(f"Шаблон '{name}' не найден")
    return path


def render_docx(template_name: str, context: dict) -> bytes:
    """Рендер шаблона в .docx-байты."""
    tpl = DocxTemplate(str(template_path(template_name)))
    tpl.render(context)
    buf = BytesIO()
    tpl.save(buf)
    return buf.getvalue()


async def convert_to_pdf(docx_bytes: bytes) -> bytes:
    """docx → PDF через JodConverter (LibreOffice)."""
    url = f"{settings.jodconverter_url}/lool/convert-to/pdf"
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            url, files={"data": ("doverennost.docx", docx_bytes, DOCX_MIME)}
        )
        resp.raise_for_status()
        return resp.content
