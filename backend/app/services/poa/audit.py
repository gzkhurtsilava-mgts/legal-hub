"""Модуль «Доверенности» — запись аудита (юридически значимый артефакт).

Пишет строку PoaAudit на изменения каталога/матрицы/лимитов/заявок. diff хранит
снимки before/after в JSON-совместимом виде.
"""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.poa import AuditAction, PoaAudit


def snapshot(obj: Any, fields: list[str]) -> dict[str, Any]:
    """JSON-совместимый снимок выбранных полей ORM-объекта (для diff)."""
    out: dict[str, Any] = {}
    for f in fields:
        val = getattr(obj, f, None)
        if isinstance(val, Enum):
            val = val.value
        elif isinstance(val, Decimal):
            val = str(val)
        elif isinstance(val, datetime | date):
            val = val.isoformat()
        out[f] = val
    return out


async def write_audit(
    db: AsyncSession,
    *,
    entity_type: str,
    entity_id: int | None,
    action: AuditAction,
    user_id: int | None,
    before: dict[str, Any] | None = None,
    after: dict[str, Any] | None = None,
) -> None:
    diff: dict[str, Any] | None = None
    if before is not None or after is not None:
        diff = {"before": before, "after": after}
    db.add(
        PoaAudit(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            diff=diff,
            user_id=user_id,
        )
    )
