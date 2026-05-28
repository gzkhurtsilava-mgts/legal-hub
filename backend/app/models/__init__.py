# Импортируй сюда все модели при их создании.
# Это нужно, чтобы Alembic autogenerate видел все таблицы.
from app.models.user import User  # noqa: F401
