import logging
from pathlib import Path

from arq import cron
from arq.connections import RedisSettings
from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal as async_session_factory
from app.models.knowledge import DocumentVersion, KnowledgeItem, PreviewStatus
from app.services.knowledge.extractors import (
    extract_slides_from_zip,
    extract_text,
    generate_preview_docx,
    generate_preview_xlsx,
)
from app.services.poa.lifecycle import expire_overdue_certificates

logger = logging.getLogger(__name__)

_DOCX_TYPES = {
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
_XLSX_TYPES = {
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
_PPTX_TYPES = {
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


async def process_document_version(ctx: dict, version_id: int) -> None:
    """Extract text and generate preview for a document version."""
    async with async_session_factory() as db:
        version = await db.scalar(select(DocumentVersion).where(DocumentVersion.id == version_id))
        if version is None:
            logger.warning("DocumentVersion %s not found", version_id)
            return

        version.preview_status = PreviewStatus.processing
        await db.flush()

        file_path = Path(settings.media_root) / version.original_file_path
        mime = version.original_mime_type

        try:
            # 1. Text extraction (FTS + future RAG)
            text = extract_text(file_path, mime)
            version.extracted_text = text

            # Propagate text to knowledge_item.content_text for FTS
            item = await db.scalar(
                select(KnowledgeItem).where(KnowledgeItem.id == version.document_id)
            )
            if item:
                item.content_text = text

            # 2. Preview generation
            base = Path(settings.media_root) / "documents" / str(version.document_id) / str(version_id) / "preview"

            if mime == "application/pdf":
                version.preview_data = {"type": "pdf"}
                version.preview_status = PreviewStatus.ready

            elif mime in _DOCX_TYPES:
                dest = base / "doc.html"
                generate_preview_docx(file_path, dest)
                rel = str(dest.relative_to(Path(settings.media_root)))
                version.preview_data = {"type": "html", "path": rel}
                version.preview_status = PreviewStatus.ready

            elif mime in _XLSX_TYPES:
                dest = base / "table.html"
                generate_preview_xlsx(file_path, dest)
                rel = str(dest.relative_to(Path(settings.media_root)))
                version.preview_data = {"type": "html", "path": rel}
                version.preview_status = PreviewStatus.ready

            elif mime in _PPTX_TYPES:
                # No auto-preview; user uploads ZIP of PNGs manually
                version.preview_data = {"type": "slides", "paths": []}
                version.preview_status = PreviewStatus.na

            else:
                version.preview_data = {"type": "download"}
                version.preview_status = PreviewStatus.ready

        except Exception as exc:
            logger.error("process_document_version %s failed: %s", version_id, exc)
            version.preview_status = PreviewStatus.failed

        await db.commit()


async def process_slides_zip(ctx: dict, version_id: int, zip_path: str) -> None:
    """Extract PNG slides from a ZIP and store paths in preview_data."""
    async with async_session_factory() as db:
        version = await db.scalar(select(DocumentVersion).where(DocumentVersion.id == version_id))
        if version is None:
            return
        try:
            dest_dir = (
                Path(settings.media_root)
                / "documents" / str(version.document_id) / str(version_id) / "slides"
            )
            abs_paths = extract_slides_from_zip(Path(zip_path), dest_dir)
            rel_paths = [str(Path(p).relative_to(Path(settings.media_root))) for p in abs_paths]
            version.preview_data = {"type": "slides", "paths": rel_paths}
            version.preview_status = PreviewStatus.ready
            await db.commit()
        except Exception as exc:
            logger.error("process_slides_zip %s failed: %s", version_id, exc)


async def expire_poa_certificates(ctx: dict) -> None:
    """Ночной перевод просроченных доверенностей active → expired."""
    async with async_session_factory() as db:
        count = await expire_overdue_certificates(db)
        await db.commit()
        if count:
            logger.info("PoA lifecycle: %s certificates expired", count)


async def startup(ctx: dict) -> None:
    logger.info("Worker started")


async def shutdown(ctx: dict) -> None:
    logger.info("Worker stopped")


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    on_startup = startup
    on_shutdown = shutdown
    functions = [process_document_version, process_slides_zip]
    cron_jobs = [cron(expire_poa_certificates, hour=3, minute=0)]
