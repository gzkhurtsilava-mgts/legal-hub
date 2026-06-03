from dataclasses import dataclass
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@dataclass
class UserContext:
    id: int
    email: str
    full_name: str
    role: UserRole


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> UserContext:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    result = await db.execute(select(User).where(User.id == int(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_error

    return UserContext(id=user.id, email=user.email, full_name=user.full_name, role=user.role)


def require_role(*roles: UserRole) -> Callable:
    async def _check(current_user: UserContext = Depends(get_current_user)) -> UserContext:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав",
            )
        return current_user

    return _check


async def check_section_write_access(
    section_id: int,
    user: UserContext,
    db: AsyncSession,
) -> None:
    """Raises 403 if user is not admin and not a declared owner of the section."""
    if user.role == UserRole.admin:
        return
    from app.models.knowledge import section_lawyers  # local import avoids circular at load time

    result = await db.execute(
        select(section_lawyers).where(
            section_lawyers.c.section_id == section_id,
            section_lawyers.c.user_id == user.id,
        )
    )
    if result.fetchone() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")
