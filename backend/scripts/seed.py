"""
Создаёт тестовых пользователей и данные базы знаний для локальной разработки.
Запуск: python -m scripts.seed (из директории backend/)
"""
import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.models.knowledge import (
    ItemStatus, ItemType, KnowledgeItem, Section, Tag, Visibility, section_lawyers,
)
from app.models.user import User, UserRole

TEST_USERS = [
    {"email": "admin@test.ru", "full_name": "Администратор", "role": UserRole.admin},
    {"email": "lawyer@test.ru", "full_name": "Юрист БПО", "role": UserRole.lawyer},
    {"email": "manager@test.ru", "full_name": "Менеджер", "role": UserRole.manager},
    {"email": "employee@test.ru", "full_name": "Сотрудник МГТС", "role": UserRole.employee},
]

PASSWORD = "test123"


async def seed_users(db) -> dict[str, User]:
    users: dict[str, User] = {}
    for data in TEST_USERS:
        result = await db.execute(select(User).where(User.email == data["email"]))
        user = result.scalar_one_or_none()
        if user is None:
            user = User(
                email=data["email"],
                full_name=data["full_name"],
                role=data["role"],
                hashed_password=hash_password(PASSWORD),
            )
            db.add(user)
            print(f"[seed] Создан: {data['email']} ({data['role'].value})")
        else:
            print(f"[seed] Уже существует: {data['email']}")
        users[data["email"]] = user
    await db.flush()
    return users


async def seed_knowledge(db, users: dict[str, User]) -> None:
    admin = users["admin@test.ru"]
    lawyer = users["lawyer@test.ru"]

    # Tags
    tags_data = [
        dict(name="НПА", slug="npa", color="#3b82f6"),
        dict(name="Договоры", slug="dogovory", color="#8b5cf6"),
        dict(name="Судебная практика", slug="sudebnaya-praktika", color="#f59e0b"),
        dict(name="Инструкция", slug="instrukciya", color="#10b981"),
        dict(name="Шаблон", slug="shablon", color="#6b7280"),
    ]
    tags: dict[str, Tag] = {}
    for data in tags_data:
        result = await db.execute(select(Tag).where(Tag.slug == data["slug"]))
        tag = result.scalar_one_or_none()
        if tag is None:
            tag = Tag(**data)
            db.add(tag)
            print(f"[seed] Тег: {data['name']}")
        tags[data["slug"]] = tag
    await db.flush()

    # Sections
    sections_raw = [
        dict(name="Договорная работа", slug="dogovornaya-rabota", order_index=0,
             description="Типовые договоры, шаблоны, НПА", icon="file-text",
             visibility=Visibility.public),
        dict(name="Судебная работа", slug="sudebnaya-rabota", order_index=1,
             description="Судебная практика, процессуальные документы", icon="scale",
             visibility=Visibility.public),
        dict(name="Нормативная база", slug="normativnaya-baza", order_index=2,
             description="Федеральные законы, приказы, регламенты", icon="book-open",
             visibility=Visibility.public),
        dict(name="Внутренние регламенты", slug="vnutrennie-reglamenty", order_index=3,
             description="Только для юристов БПО", icon="lock",
             visibility=Visibility.bpo_only),
    ]
    sections: dict[str, Section] = {}
    for data in sections_raw:
        result = await db.execute(select(Section).where(Section.slug == data["slug"]))
        sec = result.scalar_one_or_none()
        if sec is None:
            sec = Section(**data)
            db.add(sec)
            print(f"[seed] Раздел: {data['name']}")
        sections[data["slug"]] = sec
    await db.flush()

    # Subsection
    result = await db.execute(select(Section).where(Section.slug == "nda"))
    if result.scalar_one_or_none() is None:
        db.add(Section(
            parent_id=sections["dogovornaya-rabota"].id,
            name="Соглашения о конфиденциальности (NDA)",
            slug="nda", order_index=0, visibility=Visibility.public,
        ))
        print("[seed] Раздел: NDA")
    await db.flush()

    # Assign lawyer to section (direct insert to avoid async lazy-load)
    await db.execute(
        pg_insert(section_lawyers)
        .values(section_id=sections["dogovornaya-rabota"].id, user_id=lawyer.id)
        .on_conflict_do_nothing()
    )

    # Items
    items_raw = [
        dict(section_slug="dogovornaya-rabota", item_type=ItemType.article,
             title="Порядок согласования хозяйственных договоров",
             summary="Пошаговая инструкция по согласованию договоров в МГТС",
             visibility=Visibility.public, status=ItemStatus.published,
             tag_slugs=["instrukciya", "dogovory"]),
        dict(section_slug="dogovornaya-rabota", item_type=ItemType.faq,
             title="Нужно ли согласование договора на сумму до 50 000 руб.?",
             summary="Да, если договор предполагает периодические платежи.",
             visibility=Visibility.public, status=ItemStatus.published, tag_slugs=[]),
        dict(section_slug="dogovornaya-rabota", item_type=ItemType.document,
             title="Типовой договор оказания услуг связи",
             summary="Шаблон для физических лиц",
             visibility=Visibility.public, status=ItemStatus.published,
             tag_slugs=["shablon", "dogovory"]),
        dict(section_slug="sudebnaya-rabota", item_type=ItemType.article,
             title="Практика по спорам с абонентами 2024–2025",
             summary="Обзор судебной практики по ключевым категориям дел",
             visibility=Visibility.public, status=ItemStatus.published,
             tag_slugs=["sudebnaya-praktika"]),
        dict(section_slug="normativnaya-baza", item_type=ItemType.link,
             title="Федеральный закон № 126-ФЗ «О связи»",
             summary="Актуальная редакция на сайте КонсультантПлюс",
             visibility=Visibility.public, status=ItemStatus.published, tag_slugs=["npa"]),
        dict(section_slug="vnutrennie-reglamenty", item_type=ItemType.document,
             title="Регламент работы БПО (редакция 3.0)",
             summary="Только для юристов",
             visibility=Visibility.bpo_only, status=ItemStatus.published,
             tag_slugs=["instrukciya"]),
        dict(section_slug="dogovornaya-rabota", item_type=ItemType.article,
             title="Черновик: правки к типовым условиям",
             summary="В работе", visibility=Visibility.bpo_only, status=ItemStatus.draft,
             tag_slugs=[]),
    ]

    for data in items_raw:
        section = sections[data.pop("section_slug")]
        tag_slugs = data.pop("tag_slugs")
        result = await db.execute(
            select(KnowledgeItem).where(
                KnowledgeItem.title == data["title"],
                KnowledgeItem.section_id == section.id,
            )
        )
        if result.scalar_one_or_none() is not None:
            continue
        item = KnowledgeItem(**data, section_id=section.id, author_id=admin.id)
        item.tags = [tags[s] for s in tag_slugs if s in tags]
        db.add(item)
        print(f"[seed] Материал: {data['title'][:50]}")

    await db.flush()


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        users = await seed_users(db)
        await seed_knowledge(db, users)
        await db.commit()
    print(f"\n[seed] Готово. Пароль для всех: {PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
