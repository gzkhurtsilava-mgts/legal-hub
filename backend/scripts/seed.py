"""
Создаёт тестовых пользователей для локальной разработки.
Запуск: python -m scripts.seed (из директории backend/)
"""
import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

TEST_USERS = [
    {"email": "admin@test.ru", "full_name": "Администратор", "role": UserRole.admin},
    {"email": "lawyer@test.ru", "full_name": "Юрист БПО", "role": UserRole.lawyer},
    {"email": "manager@test.ru", "full_name": "Менеджер", "role": UserRole.manager},
    {"email": "employee@test.ru", "full_name": "Сотрудник МГТС", "role": UserRole.employee},
]

PASSWORD = "test123"


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        for data in TEST_USERS:
            result = await db.execute(select(User).where(User.email == data["email"]))
            if result.scalar_one_or_none() is not None:
                print(f"[seed] Уже существует: {data['email']}")
                continue

            user = User(
                email=data["email"],
                full_name=data["full_name"],
                role=data["role"],
                hashed_password=hash_password(PASSWORD),
            )
            db.add(user)
            print(f"[seed] Создан: {data['email']} ({data['role'].value})")

        await db.commit()
    print(f"[seed] Готово. Пароль для всех: {PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
