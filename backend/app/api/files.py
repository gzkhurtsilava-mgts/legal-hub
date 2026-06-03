import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import UserContext, get_current_user
from app.models.knowledge import KnowledgeItem, Visibility
from app.models.user import UserRole

router = APIRouter(tags=["files"])


def _resolve_item_id(path: str) -> int | None:
    """
    Extract knowledge_item id from media path.
    Supported patterns:
      documents/{item_id}/...
      attachments/{item_id}/...
    Returns None for inline/ paths (no per-item ACL needed).
    """
    parts = path.lstrip("/").split("/")
    if not parts:
        return None
    prefix = parts[0]
    if prefix in ("documents", "attachments") and len(parts) >= 2:
        try:
            return int(parts[1])
        except ValueError:
            return None
    return None  # inline/ — only auth required


@router.get("/api/files/{path:path}")
async def serve_file(
    path: str,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    item_id = _resolve_item_id(path)

    if item_id is not None:
        result = await db.execute(
            select(KnowledgeItem.visibility).where(KnowledgeItem.id == item_id)
        )
        row = result.first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Файл не найден")

        visibility: Visibility = row[0]
        if visibility == Visibility.bpo_only and current_user.role not in (
            UserRole.admin,
            UserRole.lawyer,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    file_path = Path(settings.media_root) / path
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Файл не найден")

    # Prevent path traversal
    try:
        file_path.resolve().relative_to(Path(settings.media_root).resolve())
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    return FileResponse(str(file_path))
