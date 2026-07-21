"""Общие помощники роутеров модуля «Доверенности»."""

from fastapi import HTTPException


def reject_nulls_for_required(model, data: dict) -> None:
    """Явный null в PUT для NOT NULL-колонки → 422.

    Update-схемы объявляют поля как `X | None` (частичное обновление), поэтому
    очищенное на фронте обязательное поле приходит как null и без проверки
    улетает setattr'ом в NOT NULL-колонку → IntegrityError → 500.
    """
    cols = model.__table__.columns
    bad = [k for k, v in data.items() if v is None and k in cols and not cols[k].nullable]
    if bad:
        raise HTTPException(
            status_code=422,
            detail=f"Поля не могут быть пустыми: {', '.join(bad)}",
        )
