"""Модуль «Доверенности» — жизненный цикл записей реестра.

Единственная точка авто-перевода active → expired. Вызывается ночным
arq-кроном (app/worker.py), а не на каждом чтении реестра/кабинета: чтение
не должно открывать write-транзакцию с UPDATE по таблице.
"""

from datetime import date

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.poa import CertificateStatus, PoaCertificate


async def expire_overdue_certificates(db: AsyncSession) -> int:
    """Доверенности с истёкшим сроком: active → expired. Возвращает число строк."""
    result = await db.execute(
        update(PoaCertificate)
        .where(
            PoaCertificate.status == CertificateStatus.active,
            PoaCertificate.valid_to.is_not(None),
            PoaCertificate.valid_to < date.today(),
        )
        .values(status=CertificateStatus.expired)
    )
    return result.rowcount or 0
