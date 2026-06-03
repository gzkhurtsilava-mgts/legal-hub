"""
Text extraction and preview generation for document versions.
All operations are synchronous (called from arq worker).
"""
import html
import io
import zipfile
from pathlib import Path


# ─── Text extraction ──────────────────────────────────────────────────────────

def extract_text_pdf(path: Path) -> str:
    from pypdf import PdfReader
    reader = PdfReader(str(path))
    parts = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(p for p in parts if p).strip()


def extract_text_docx(path: Path) -> str:
    from docx import Document
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text_xlsx(path: Path) -> str:
    from openpyxl import load_workbook
    wb = load_workbook(str(path), read_only=True, data_only=True)
    parts: list[str] = []
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            cells = [str(c) for c in row if c is not None]
            if cells:
                parts.append(" | ".join(cells))
    return "\n".join(parts)


def extract_text_pptx(path: Path) -> str:
    from pptx import Presentation
    prs = Presentation(str(path))
    parts: list[str] = []
    for i, slide in enumerate(prs.slides, 1):
        slide_texts: list[str] = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                slide_texts.append(shape.text.strip())
        if slide_texts:
            parts.append(f"[Слайд {i}]\n" + "\n".join(slide_texts))
    return "\n\n".join(parts)


def extract_text(path: Path, mime_type: str) -> str:
    try:
        if mime_type == "application/pdf":
            return extract_text_pdf(path)
        if mime_type in (
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ):
            return extract_text_docx(path)
        if mime_type in (
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ):
            return extract_text_xlsx(path)
        if mime_type in (
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ):
            return extract_text_pptx(path)
    except Exception:
        pass
    return ""


# ─── Preview generation ───────────────────────────────────────────────────────

_HTML_WRAP = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body {{ font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #1d2023;
         padding: 24px 32px; margin: 0; line-height: 1.6; }}
  table {{ border-collapse: collapse; width: 100%; font-size: 13px; }}
  th {{ background: #f2f3f7; text-align: left; }}
  th, td {{ border: 1px solid #e0e0e0; padding: 6px 10px; }}
  tr:hover td {{ background: #f9f9f9; }}
  h1,h2,h3 {{ color: #1d2023; }}
  blockquote {{ border-left: 3px solid #008ae0; padding-left: 12px; color: #626c77; }}
  img {{ max-width: 100%; }}
</style>
</head>
<body>{body}</body>
</html>"""


def generate_preview_docx(path: Path, dest: Path) -> None:
    import mammoth
    with open(str(path), "rb") as f:
        result = mammoth.convert_to_html(f)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(_HTML_WRAP.format(body=result.value), encoding="utf-8")


def generate_preview_xlsx(path: Path, dest: Path) -> None:
    from openpyxl import load_workbook
    wb = load_workbook(str(path), read_only=True, data_only=True)
    sheets_html: list[str] = []
    for sheet in wb.worksheets:
        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            continue
        header, *body_rows = rows
        th = "".join(f"<th>{html.escape(str(c) if c is not None else '')}</th>" for c in header)
        trs = ""
        for row in body_rows:
            tds = "".join(f"<td>{html.escape(str(c) if c is not None else '')}</td>" for c in row)
            trs += f"<tr>{tds}</tr>"
        sheets_html.append(
            f"<h2>{html.escape(sheet.title)}</h2>"
            f"<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>"
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(_HTML_WRAP.format(body="".join(sheets_html)), encoding="utf-8")


def extract_slides_from_zip(zip_path: Path, dest_dir: Path) -> list[str]:
    """Extract PNG/JPG images from ZIP into dest_dir, return sorted relative paths."""
    ALLOWED = {".png", ".jpg", ".jpeg", ".webp"}
    dest_dir.mkdir(parents=True, exist_ok=True)
    paths: list[str] = []
    with zipfile.ZipFile(str(zip_path)) as zf:
        names = sorted(n for n in zf.namelist() if Path(n).suffix.lower() in ALLOWED)
        for name in names:
            out = dest_dir / Path(name).name
            out.write_bytes(zf.read(name))
            paths.append(str(out))
    return paths
