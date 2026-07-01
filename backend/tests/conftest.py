"""Общие фикстуры pytest для бэкенда Legal Hub.

DB-фикстуры требуют доступного PostgreSQL (в Docker или локально). Адрес берётся
из TEST_DATABASE_URL, по умолчанию — отдельная БД legalhub_test. Тесты, которым БД
не нужна (например, проверки метаданных моделей), не используют эти фикстуры и
проходят без поднятого PostgreSQL.
"""

import os

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401 — регистрируем все модели в Base.metadata
from app.core.database import Base, get_db
from app.core.deps import UserContext, get_current_user
from app.main import app
from app.models.user import UserRole

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://legalhub:legalhub_dev@localhost:5432/legalhub_test",
)


@pytest_asyncio.fixture
async def engine():
    """Движок тестовой БД: создаёт схему из метаданных перед тестом, сносит после."""
    eng = create_async_engine(TEST_DATABASE_URL)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncSession:
    """Сессия в транзакции, откатываемой после теста (изоляция)."""
    conn = await engine.connect()
    trans = await conn.begin()
    session_factory = async_sessionmaker(bind=conn, expire_on_commit=False, class_=AsyncSession)
    session = session_factory()
    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await conn.close()


@pytest_asyncio.fixture
async def client(db_session) -> AsyncClient:
    """HTTP-клиент к приложению; get_db переопределён на тестовую сессию (без commit)."""

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


def _login_as(role: UserRole, user_id: int = 1):
    """Помощник: переопределяет текущего пользователя ролью для RBAC-тестов."""

    async def _override():
        return UserContext(
            id=user_id, email=f"{role.value}@test.ru", full_name=role.value, role=role
        )

    app.dependency_overrides[get_current_user] = _override


@pytest_asyncio.fixture
def as_lawyer():
    _login_as(UserRole.lawyer)
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest_asyncio.fixture
def as_employee():
    _login_as(UserRole.employee)
    yield
    app.dependency_overrides.pop(get_current_user, None)
