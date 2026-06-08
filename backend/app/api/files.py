from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.knowledge import KnowledgeItem, Visibility
from app.models.user import User, UserRole
from app.core.deps import UserContext

router = APIRouter(tags=["files"])


def _resolve_item_id(path: str) -> int | None:
    parts = path.lstrip("/").split("/")
    if not parts:
        return None
    prefix = parts[0]
    if prefix in ("documents", "attachments") and len(parts) >= 2:
        try:
            return int(parts[1])
        except ValueError:
            return None
    return None


async def _auth_from_request(
    request: Request,
    token_param: str | None,
    db: AsyncSession,
) -> UserContext:
    """Authenticate via Authorization header OR ?token= query param (for iframes/img tags)."""
    raw_token: str | None = None

    # 1. Try Authorization header
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        raw_token = auth_header[7:]

    # 2. Fall back to query param (used by <iframe>, <img>, <a download>)
    if not raw_token and token_param:
        raw_token = token_param

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(raw_token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")

    result = await db.execute(
        select(User).where(User.id == int(user_id), User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")

    return UserContext(id=user.id, email=user.email, full_name=user.full_name, role=user.role)


@router.get("/api/files/{path:path}")
async def serve_file(
    path: str,
    request: Request,
    token: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    # Reject any path containing '..' before any auth decision — Starlette does not
    # normalize '..' in {path:path} params, so 'inline/../documents/42/x' would bypass
    # the is_inline check below and serve authenticated files without a token.
    if ".." in Path(path).parts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Недопустимый путь")

    # Inline media (article images) are public — URLs are UUID-based and unguessable.
    # Storing tokens in TipTap content would cause expiration issues.
    is_inline = path.startswith("inline/")
    current_user = None if is_inline else await _auth_from_request(request, token, db)

    item_id = _resolve_item_id(path)
    if item_id is not None and current_user is not None:
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
