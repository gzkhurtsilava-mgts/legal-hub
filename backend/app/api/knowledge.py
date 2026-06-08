import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

import aiofiles
from arq import create_pool
from arq.connections import RedisSettings
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import UserContext, check_section_write_access, get_current_user, require_role
from app.services.knowledge.search import build_search_conditions, search_rank, translate_layout
from app.services.knowledge.tiptap import extract_text as tiptap_extract_text
from app.models.knowledge import (
    Article,
    Document,
    DocumentVersion,
    ItemStatus,
    ItemType,
    KnowledgeItem,
    Link,
    PreviewStatus,
    Section,
    Tag,
    UserFavorite,
    Visibility,
    knowledge_item_tags,
)
from app.models.user import UserRole
from app.schemas.knowledge import (
    ArticleContent,
    ArticleContentUpdate,
    AttachmentMeta,
    DocumentVersionCreate,
    DocumentVersionResponse,
    DocumentVersionUpdate,
    KnowledgeItemCreate,
    KnowledgeItemListResponse,
    KnowledgeItemResponse,
    KnowledgeItemUpdate,
    SectionCreate,
    SectionDetailResponse,
    SectionResponse,
    SectionUpdate,
    TagCreate,
    LinkContent,
    LinkContentUpdate,
    TagResponse,
    TypeaheadItem,
    TypeaheadResponse,
    TypeaheadSection,
    UploadedFile,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

_EDITOR_ROLES = (UserRole.admin, UserRole.lawyer)
_NOW = lambda: datetime.now(timezone.utc)  # noqa: E731


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _visible_section_filter(user: UserContext):
    if user.role in _EDITOR_ROLES:
        return None  # no filter
    return Section.visibility == Visibility.public


def _visible_item_filter(user: UserContext):
    if user.role in _EDITOR_ROLES:
        return None
    return KnowledgeItem.visibility == Visibility.public


def _published_item_filter(user: UserContext):
    if user.role in _EDITOR_ROLES:
        return None
    return KnowledgeItem.status == ItemStatus.published


async def _get_favorite_ids(user_id: int, db: AsyncSession) -> set[int]:
    result = await db.execute(
        select(UserFavorite.item_id).where(UserFavorite.user_id == user_id)
    )
    return set(result.scalars().all())


def _item_response(item: KnowledgeItem, favorite_ids: set[int]) -> KnowledgeItemResponse:
    resp = KnowledgeItemResponse.model_validate(item)
    return resp.model_copy(update={"is_favorite": item.id in favorite_ids})


async def _require_item(item_id: int, db: AsyncSession) -> KnowledgeItem:
    result = await db.execute(
        select(KnowledgeItem)
        .options(selectinload(KnowledgeItem.tags))
        .where(KnowledgeItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Материал не найден")
    return item


async def _require_section(section_id: int, db: AsyncSession) -> Section:
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Раздел не найден")
    return section


# ─── Sections ─────────────────────────────────────────────────────────────────

@router.get("/sections", response_model=list[SectionResponse])
async def list_sections(
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SectionResponse]:
    query = select(Section).order_by(Section.order_index, Section.id)
    vis_filter = _visible_section_filter(current_user)
    if vis_filter is not None:
        query = query.where(vis_filter)

    result = await db.execute(query)
    sections = result.scalars().all()

    # Count items per section in one query
    count_result = await db.execute(
        select(KnowledgeItem.section_id, func.count(KnowledgeItem.id))
        .group_by(KnowledgeItem.section_id)
    )
    counts = dict(count_result.all())

    return [
        SectionResponse.model_validate(s).model_copy(update={"item_count": counts.get(s.id, 0)})
        for s in sections
    ]


@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    body: SectionCreate,
    current_user: UserContext = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> SectionResponse:
    if body.parent_id is not None:
        await _require_section(body.parent_id, db)

    section = Section(**body.model_dump())
    db.add(section)
    await db.flush()
    await db.refresh(section)
    return SectionResponse.model_validate(section)


@router.get("/sections/by-slug/{slug}", response_model=SectionDetailResponse)
async def get_section_by_slug(
    slug: str,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SectionDetailResponse:
    result = await db.execute(
        select(Section)
        .options(selectinload(Section.children))
        .where(Section.slug == slug)
    )
    section = result.scalar_one_or_none()
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Раздел не найден")
    if section.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")
    item_count = await db.scalar(
        select(func.count(KnowledgeItem.id)).where(KnowledgeItem.section_id == section.id)
    ) or 0
    visible_children = [
        SectionResponse.model_validate(c)
        for c in section.children
        if current_user.role in _EDITOR_ROLES or c.visibility == Visibility.public
    ]
    return SectionDetailResponse.model_validate(section).model_copy(
        update={"item_count": item_count, "children": visible_children}
    )


@router.get("/sections/{section_id}", response_model=SectionDetailResponse)
async def get_section(
    section_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SectionDetailResponse:
    result = await db.execute(
        select(Section)
        .options(selectinload(Section.children))
        .where(Section.id == section_id)
    )
    section = result.scalar_one_or_none()
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Раздел не найден")

    if section.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    item_count_result = await db.execute(
        select(func.count(KnowledgeItem.id)).where(KnowledgeItem.section_id == section_id)
    )
    item_count = item_count_result.scalar() or 0

    visible_children = [
        SectionResponse.model_validate(c)
        for c in section.children
        if current_user.role in _EDITOR_ROLES or c.visibility == Visibility.public
    ]
    return SectionDetailResponse.model_validate(section).model_copy(
        update={"item_count": item_count, "children": visible_children}
    )


@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    body: SectionUpdate,
    current_user: UserContext = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> SectionResponse:
    section = await _require_section(section_id, db)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(section, field, value)
    section.updated_at = _NOW()
    await db.flush()
    await db.refresh(section)
    return SectionResponse.model_validate(section)


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: int,
    current_user: UserContext = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> None:
    section = await _require_section(section_id, db)

    child_count = await db.scalar(
        select(func.count(Section.id)).where(Section.parent_id == section_id)
    )
    item_count = await db.scalar(
        select(func.count(KnowledgeItem.id)).where(KnowledgeItem.section_id == section_id)
    )
    if (child_count or 0) > 0 or (item_count or 0) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Раздел не пуст — удалите содержимое и подразделы сначала",
        )

    await db.delete(section)


# ─── Search ───────────────────────────────────────────────────────────────────

@router.get("/search/typeahead", response_model=TypeaheadResponse)
async def typeahead(
    q: str = Query(..., min_length=2),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TypeaheadResponse:
    q_clean = q.strip()
    q_ru = translate_layout(q_clean)
    variants = list({q_clean, q_ru})

    def _title_condition(col):
        return or_(*(
            or_(col.op("%")(v), col.ilike(f"%{v}%"))
            for v in variants
        ))

    sec_q = (
        select(Section)
        .where(_title_condition(Section.name))
        .order_by(func.similarity(Section.name, q_ru).desc())
        .limit(5)
    )
    vis = _visible_section_filter(current_user)
    if vis is not None:
        sec_q = sec_q.where(vis)
    sections = (await db.execute(sec_q)).scalars().all()

    item_q = (
        select(KnowledgeItem)
        .where(_title_condition(KnowledgeItem.title))
        .where(KnowledgeItem.status == ItemStatus.published)
        .order_by(func.similarity(KnowledgeItem.title, q_ru).desc())
        .limit(7)
    )
    vis2 = _visible_item_filter(current_user)
    if vis2 is not None:
        item_q = item_q.where(vis2)
    items = (await db.execute(item_q)).scalars().all()

    return TypeaheadResponse(
        sections=[TypeaheadSection.model_validate(s) for s in sections],
        items=[TypeaheadItem.model_validate(i) for i in items],
    )


@router.get("/search", response_model=KnowledgeItemListResponse)
async def search(
    q: str = Query(..., min_length=2),
    section_id: int | None = Query(None),
    item_type: str | None = Query(None),
    tag_ids: Annotated[list[int], Query()] = [],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemListResponse:
    cond = build_search_conditions(q)
    if cond is None:
        return KnowledgeItemListResponse(items=[], total=0, skip=skip, limit=limit)

    query = select(KnowledgeItem).options(selectinload(KnowledgeItem.tags)).where(cond)

    vis = _visible_item_filter(current_user)
    if vis is not None:
        query = query.where(vis)
    pub = _published_item_filter(current_user)
    if pub is not None:
        query = query.where(pub)

    if section_id:
        query = query.where(KnowledgeItem.section_id == section_id)
    if item_type:
        query = query.where(KnowledgeItem.item_type == item_type)
    if tag_ids:
        query = (
            query.join(knowledge_item_tags, knowledge_item_tags.c.item_id == KnowledgeItem.id)
            .where(knowledge_item_tags.c.tag_id.in_(tag_ids))
            .distinct()
        )

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.order_by(search_rank(q).desc()).offset(skip).limit(limit)

    items = (await db.execute(query)).scalars().unique().all()
    fav_ids = await _get_favorite_ids(current_user.id, db)

    return KnowledgeItemListResponse(
        items=[_item_response(item, fav_ids) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


# ─── Items ────────────────────────────────────────────────────────────────────

@router.get("/items", response_model=KnowledgeItemListResponse)
async def list_items(
    section_id: int | None = Query(None),
    item_type: str | None = Query(None),
    tag_ids: Annotated[list[int], Query()] = [],
    status_filter: str | None = Query(None, alias="status"),
    favorites_only: bool = Query(False),
    q: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemListResponse:
    query = select(KnowledgeItem).options(selectinload(KnowledgeItem.tags))

    vis_filter = _visible_item_filter(current_user)
    if vis_filter is not None:
        query = query.where(vis_filter)

    pub_filter = _published_item_filter(current_user)
    if pub_filter is not None:
        query = query.where(pub_filter)
    elif status_filter:
        query = query.where(KnowledgeItem.status == status_filter)

    if section_id is not None:
        query = query.where(KnowledgeItem.section_id == section_id)

    if item_type:
        query = query.where(KnowledgeItem.item_type == item_type)

    if tag_ids:
        query = query.join(
            knowledge_item_tags, knowledge_item_tags.c.item_id == KnowledgeItem.id
        ).where(knowledge_item_tags.c.tag_id.in_(tag_ids)).distinct()

    if q:
        cond = build_search_conditions(q)
        if cond is not None:
            query = query.where(cond)

    if favorites_only:
        query = query.join(
            UserFavorite,
            (UserFavorite.item_id == KnowledgeItem.id)
            & (UserFavorite.user_id == current_user.id),
        )

    total_q = select(func.count()).select_from(query.subquery())
    total = await db.scalar(total_q) or 0

    query = query.order_by(KnowledgeItem.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().unique().all()

    favorite_ids = await _get_favorite_ids(current_user.id, db)

    return KnowledgeItemListResponse(
        items=[_item_response(item, favorite_ids) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/items", response_model=KnowledgeItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    body: KnowledgeItemCreate,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemResponse:
    await check_section_write_access(body.section_id, current_user, db)

    tags: list[Tag] = []
    if body.tag_ids:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(body.tag_ids)))
        tags = list(tag_result.scalars().all())
        if len(tags) != len(body.tag_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Некоторые теги не найдены")

    item = KnowledgeItem(
        section_id=body.section_id,
        item_type=body.item_type,
        title=body.title,
        summary=body.summary,
        visibility=body.visibility,
        author_id=current_user.id,
        tags=tags,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item, ["tags"])
    return _item_response(item, set())


@router.get("/items/{item_id}", response_model=KnowledgeItemResponse)
async def get_item(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemResponse:
    item = await _require_item(item_id, db)

    if item.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")
    if item.status != ItemStatus.published and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Материал не опубликован")

    fav_ids = await _get_favorite_ids(current_user.id, db)
    return _item_response(item, fav_ids)


@router.put("/items/{item_id}", response_model=KnowledgeItemResponse)
async def update_item(
    item_id: int,
    body: KnowledgeItemUpdate,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)

    if body.section_id is not None and body.section_id != item.section_id:
        await check_section_write_access(body.section_id, current_user, db)

    for field, value in body.model_dump(exclude_none=True, exclude={"tag_ids"}).items():
        setattr(item, field, value)

    if body.tag_ids is not None:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(body.tag_ids)))
        tags = list(tag_result.scalars().all())
        if len(tags) != len(body.tag_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Некоторые теги не найдены")
        item.tags = tags

    item.updated_at = _NOW()
    await db.flush()
    await db.refresh(item, ["tags"])
    fav_ids = await _get_favorite_ids(current_user.id, db)
    return _item_response(item, fav_ids)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    await db.delete(item)


@router.post("/items/{item_id}/publish", response_model=KnowledgeItemResponse)
async def publish_item(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)

    if item.status != ItemStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Опубликовать можно только черновик",
        )

    item.status = ItemStatus.published
    if item.published_at is None:
        item.published_at = _NOW()
    item.updated_at = _NOW()
    await db.flush()
    fav_ids = await _get_favorite_ids(current_user.id, db)
    return _item_response(item, fav_ids)


@router.post("/items/{item_id}/archive", response_model=KnowledgeItemResponse)
async def archive_item(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)

    if item.status != ItemStatus.published:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="В архив можно перевести только опубликованный материал",
        )

    item.status = ItemStatus.archived
    item.updated_at = _NOW()
    await db.flush()
    fav_ids = await _get_favorite_ids(current_user.id, db)
    return _item_response(item, fav_ids)


# ─── Tags ─────────────────────────────────────────────────────────────────────

@router.get("/tags", response_model=list[TagResponse])
async def list_tags(
    item_type: str | None = Query(None),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TagResponse]:
    query = (
        select(Tag, func.count(knowledge_item_tags.c.item_id).label("item_count"))
        .outerjoin(knowledge_item_tags, knowledge_item_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(Tag.name)
    )
    if item_type:
        query = query.where(Tag.entity_type == item_type)
    result = await db.execute(query)
    return [
        TagResponse.model_validate(tag).model_copy(update={"item_count": count})
        for tag, count in result.all()
    ]


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    body: TagCreate,
    current_user: UserContext = Depends(require_role(UserRole.admin, UserRole.lawyer)),
    db: AsyncSession = Depends(get_db),
) -> TagResponse:
    tag = Tag(**body.model_dump())
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return TagResponse.model_validate(tag)


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    current_user: UserContext = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if tag is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тег не найден")
    await db.delete(tag)


# ─── Favorites ────────────────────────────────────────────────────────────────

@router.get("/favorites", response_model=KnowledgeItemListResponse)
async def list_favorites(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeItemListResponse:
    query = (
        select(KnowledgeItem)
        .options(selectinload(KnowledgeItem.tags))
        .join(UserFavorite, (UserFavorite.item_id == KnowledgeItem.id) & (UserFavorite.user_id == current_user.id))
        .order_by(UserFavorite.created_at.desc())
    )

    vis_filter = _visible_item_filter(current_user)
    if vis_filter is not None:
        query = query.where(vis_filter)

    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().unique().all()
    favorite_ids = {item.id for item in items}

    return KnowledgeItemListResponse(
        items=[_item_response(item, favorite_ids) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post("/items/{item_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def add_favorite(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await _require_item(item_id, db)

    if item.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    existing = await db.scalar(
        select(UserFavorite).where(
            UserFavorite.user_id == current_user.id, UserFavorite.item_id == item_id
        )
    )
    if existing is None:
        db.add(UserFavorite(user_id=current_user.id, item_id=item_id))


@router.delete("/items/{item_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    fav = await db.scalar(
        select(UserFavorite).where(
            UserFavorite.user_id == current_user.id, UserFavorite.item_id == item_id
        )
    )
    if fav is not None:
        await db.delete(fav)


# ─── Article content ──────────────────────────────────────────────────────────

@router.get("/items/{item_id}/article", response_model=ArticleContent)
async def get_article(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArticleContent:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.article:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Элемент не является статьёй")
    vis = _visible_item_filter(current_user)
    if vis is not None and item.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    result = await db.execute(select(Article).where(Article.item_id == item_id))
    article = result.scalar_one_or_none()
    if article is None:
        return ArticleContent()
    return ArticleContent.model_validate(article)


@router.put("/items/{item_id}/article", response_model=ArticleContent)
async def update_article(
    item_id: int,
    body: ArticleContentUpdate,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArticleContent:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.article:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Элемент не является статьёй")
    await check_section_write_access(item.section_id, current_user, db)

    result = await db.execute(select(Article).where(Article.item_id == item_id))
    article = result.scalar_one_or_none()

    if article is None:
        article = Article(item_id=item_id, content=body.content, toc_enabled=body.toc_enabled)
        db.add(article)
    else:
        article.content = body.content
        article.toc_enabled = body.toc_enabled

    # Update FTS content_text
    if body.content:
        item.content_text = tiptap_extract_text(body.content)

    await db.flush()
    await db.refresh(article)
    return ArticleContent.model_validate(article)


# ─── Link content ─────────────────────────────────────────────────────────────

@router.get("/items/{item_id}/link", response_model=LinkContent)
async def get_link(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LinkContent:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.link:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Элемент не является ссылкой")
    if item.visibility == Visibility.bpo_only and current_user.role not in _EDITOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ закрыт")

    result = await db.execute(select(Link).where(Link.item_id == item_id))
    link = result.scalar_one_or_none()
    if link is None:
        return LinkContent(url="")
    return LinkContent.model_validate(link)


@router.put("/items/{item_id}/link", response_model=LinkContent)
async def update_link(
    item_id: int,
    body: LinkContentUpdate,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LinkContent:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.link:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Элемент не является ссылкой")
    await check_section_write_access(item.section_id, current_user, db)

    result = await db.execute(select(Link).where(Link.item_id == item_id))
    link = result.scalar_one_or_none()

    if link is None:
        link = Link(item_id=item_id, url=body.url)
        db.add(link)
    else:
        link.url = body.url

    item.content_text = body.url
    await db.flush()
    await db.refresh(link)
    return LinkContent.model_validate(link)


# ─── Uploads ──────────────────────────────────────────────────────────────────

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
_ALLOWED_ATTACH_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
}
_MAX_INLINE_MB = 10
_MAX_ATTACH_MB = 50


async def _save_upload(file: UploadFile, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    size = 0
    async with aiofiles.open(dest, "wb") as f:
        while chunk := await file.read(1024 * 256):
            await f.write(chunk)
            size += len(chunk)
    return size


@router.post("/uploads/media", response_model=UploadedFile)
async def upload_media(
    file: UploadFile = File(...),
    current_user: UserContext = Depends(require_role(UserRole.admin, UserRole.lawyer)),
) -> UploadedFile:
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Недопустимый тип файла")

    now = datetime.now(timezone.utc)
    filename = f"{uuid.uuid4().hex}-{file.filename}"
    rel_path = f"inline/{now.year}/{now.month:02d}/{filename}"
    dest = Path(settings.media_root) / rel_path

    size = await _save_upload(file, dest)
    if size > _MAX_INLINE_MB * 1024 * 1024:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Файл > {_MAX_INLINE_MB} МБ")

    return UploadedFile(url=f"/api/files/{rel_path}", filename=file.filename or filename,
                        size=size, mime_type=file.content_type or "application/octet-stream")


@router.post("/uploads/attachment", response_model=UploadedFile)
async def upload_attachment(
    item_id: int = Query(...),
    file: UploadFile = File(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UploadedFile:
    if file.content_type not in _ALLOWED_ATTACH_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Недопустимый тип файла")

    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)

    filename = f"{uuid.uuid4().hex}-{file.filename}"
    rel_path = f"attachments/{item_id}/{filename}"
    dest = Path(settings.media_root) / rel_path

    size = await _save_upload(file, dest)
    if size > _MAX_ATTACH_MB * 1024 * 1024:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Файл > {_MAX_ATTACH_MB} МБ")

    # Append to article.attachments
    result = await db.execute(select(Article).where(Article.item_id == item_id))
    article = result.scalar_one_or_none()
    if article:
        current = list(article.attachments or [])
        current.append({"filename": file.filename, "path": rel_path,
                        "size": size, "mime_type": file.content_type or "application/octet-stream"})
        article.attachments = current

    return UploadedFile(url=f"/api/files/{rel_path}", filename=file.filename or filename,
                        size=size, mime_type=file.content_type or "application/octet-stream")


def _remove_file_embeds(node: dict, path: str) -> dict | None:
    """Рекурсивно удаляет fileEmbed-узлы с указанным path. Возвращает None если узел нужно удалить."""
    if node.get("type") == "fileEmbed" and node.get("attrs", {}).get("path") == path:
        return None
    if "content" in node:
        node = {**node, "content": [
            child for raw in node["content"]
            if (child := _remove_file_embeds(raw, path)) is not None
        ]}
    return node


@router.delete("/items/{item_id}/attachments", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    item_id: int,
    path: str = Query(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    result = await db.execute(select(Article).where(Article.item_id == item_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=404, detail="Статья не найдена")
    article.attachments = [
        att for att in (article.attachments or []) if att.get("path") != path
    ]
    # Убираем fileEmbed-узлы из тела статьи
    if article.content:
        article.content = _remove_file_embeds(article.content, path)
        flag_modified(article, "content")
    flag_modified(article, "attachments")
    await db.commit()
    # Удаляем физический файл — проверяем что путь внутри media_root
    # (Path(x) / "/abs" даёт "/abs", поэтому containment-check обязателен)
    file_path = Path(settings.media_root) / path
    try:
        file_path.resolve().relative_to(Path(settings.media_root).resolve())
    except ValueError:
        return  # путь вне media_root — файл не трогаем, запись уже удалена из БД
    file_path.unlink(missing_ok=True)


# ─── Document versions ────────────────────────────────────────────────────────

_ALLOWED_DOC_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}
_MAX_DOC_MB = 100


async def _enqueue(func_name: str, *args) -> None:
    try:
        pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
        await pool.enqueue_job(func_name, *args)
        await pool.aclose()
    except Exception:
        pass  # Worker недоступен — задача потеряна, не критично в dev


@router.get("/items/{item_id}/versions", response_model=list[DocumentVersionResponse])
async def list_versions(
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DocumentVersionResponse]:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.document:
        raise HTTPException(status_code=400, detail="Элемент не является документом")
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == item_id)
        .order_by(DocumentVersion.uploaded_at.desc())
    )
    return [DocumentVersionResponse.model_validate(v) for v in result.scalars().all()]


@router.post("/items/{item_id}/versions", response_model=DocumentVersionResponse, status_code=201)
async def upload_version(
    item_id: int,
    pdf_file: UploadFile = File(...),
    source_file: UploadFile | None = File(None),
    version_label: str = Form(...),
    notes: str | None = Form(None),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    item = await _require_item(item_id, db)
    if item.item_type != ItemType.document:
        raise HTTPException(status_code=400, detail="Элемент не является документом")
    if pdf_file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Основной файл должен быть PDF")
    await check_section_write_access(item.section_id, current_user, db)

    doc = await db.scalar(select(Document).where(Document.item_id == item_id))
    if doc is None:
        doc = Document(item_id=item_id)
        db.add(doc)
        await db.flush()

    # Save PDF as primary file
    pdf_name = f"{uuid.uuid4().hex}-{pdf_file.filename or 'document.pdf'}"
    pdf_rel = f"documents/{item_id}/pdf/{pdf_name}"
    pdf_dest = Path(settings.media_root) / pdf_rel
    pdf_dest.parent.mkdir(parents=True, exist_ok=True)
    pdf_size = await _save_upload(pdf_file, pdf_dest)
    if pdf_size > _MAX_DOC_MB * 1024 * 1024:
        pdf_dest.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"Файл > {_MAX_DOC_MB} МБ")

    existing_current = await db.scalar(
        select(DocumentVersion).where(
            DocumentVersion.document_id == item_id,
            DocumentVersion.is_current == True,  # noqa: E712
        )
    )
    version = DocumentVersion(
        document_id=item_id,
        version_label=version_label,
        original_filename=pdf_file.filename or pdf_name,
        original_file_path=pdf_rel,
        original_mime_type="application/pdf",
        file_size=pdf_size,
        notes=notes,
        is_current=not bool(existing_current),
        uploaded_by_id=current_user.id,
        preview_status=PreviewStatus.ready,
        preview_data={"type": "pdf"},
    )

    # Save optional source file
    if source_file and source_file.filename:
        src_name = f"{uuid.uuid4().hex}-{source_file.filename}"
        src_rel = f"documents/{item_id}/source/{src_name}"
        src_dest = Path(settings.media_root) / src_rel
        src_dest.parent.mkdir(parents=True, exist_ok=True)
        src_size = await _save_upload(source_file, src_dest)
        if src_size > _MAX_DOC_MB * 1024 * 1024:
            src_dest.unlink(missing_ok=True)
            pdf_dest.unlink(missing_ok=True)
            raise HTTPException(status_code=413, detail=f"Исходный файл > {_MAX_DOC_MB} МБ")
        version.source_filename = source_file.filename
        version.source_file_path = src_rel
        version.source_file_size = src_size
        version.source_mime_type = source_file.content_type or "application/octet-stream"

    db.add(version)
    await db.flush()
    await db.refresh(version)
    await db.commit()
    return DocumentVersionResponse.model_validate(version)


@router.delete("/items/{item_id}/versions/{version_id}", status_code=204)
async def delete_version(
    item_id: int,
    version_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    version = await _get_version(item_id, version_id, db)
    was_current = version.is_current
    await db.delete(version)
    await db.flush()
    if was_current:
        next_v = await db.scalar(
            select(DocumentVersion)
            .where(DocumentVersion.document_id == item_id, DocumentVersion.id != version_id)
            .order_by(DocumentVersion.uploaded_at.desc())
            .limit(1)
        )
        if next_v:
            next_v.is_current = True
    await db.commit()


@router.post("/items/{item_id}/versions/{version_id}/slides", response_model=DocumentVersionResponse)
async def upload_slides_zip(
    item_id: int,
    version_id: int,
    file: UploadFile = File(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    """Upload ZIP of PNG slide exports for PPTX preview."""
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)

    if file.content_type not in ("application/zip", "application/x-zip-compressed"):
        raise HTTPException(status_code=415, detail="Ожидается ZIP-архив")

    version = await _get_version(item_id, version_id, db)

    tmp_path = Path(settings.media_root) / "tmp" / f"{uuid.uuid4().hex}.zip"
    tmp_path.parent.mkdir(parents=True, exist_ok=True)
    await _save_upload(file, tmp_path)

    await _enqueue("process_slides_zip", version_id, str(tmp_path))

    version.preview_status = PreviewStatus.processing
    await db.commit()
    await db.refresh(version)
    return DocumentVersionResponse.model_validate(version)


async def _get_version(item_id: int, version_id: int, db: AsyncSession) -> DocumentVersion:
    v = await db.scalar(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id,
            DocumentVersion.document_id == item_id,
        )
    )
    if v is None:
        raise HTTPException(status_code=404, detail="Версия не найдена")
    return v


@router.patch("/items/{item_id}/versions/{version_id}", response_model=DocumentVersionResponse)
async def update_version_meta(
    item_id: int,
    version_id: int,
    data: DocumentVersionUpdate,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    version = await _get_version(item_id, version_id, db)
    if data.version_label is not None:
        version.version_label = data.version_label
    if data.notes is not None:
        version.notes = data.notes
    if data.effective_date is not None:
        version.effective_date = data.effective_date
    await db.commit()
    await db.refresh(version)
    return DocumentVersionResponse.model_validate(version)


@router.post("/items/{item_id}/versions/{version_id}/set-current", response_model=DocumentVersionResponse)
async def set_current_version(
    item_id: int,
    version_id: int,
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    # Unset all others first
    await db.execute(
        update(DocumentVersion)
        .where(DocumentVersion.document_id == item_id)
        .values(is_current=False)
    )
    version = await _get_version(item_id, version_id, db)
    version.is_current = True
    await db.commit()
    await db.refresh(version)
    return DocumentVersionResponse.model_validate(version)


@router.put("/items/{item_id}/versions/{version_id}/file", response_model=DocumentVersionResponse)
async def replace_version_file(
    item_id: int,
    version_id: int,
    file: UploadFile = File(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    version = await _get_version(item_id, version_id, db)

    filename = (file.filename or "document").replace(" ", "_")
    dest = Path(settings.media_root) / "documents" / str(item_id) / str(version_id) / "original" / filename
    size = await _save_upload(file, dest)
    if size > _MAX_DOC_MB * 1024 * 1024:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"Файл > {_MAX_DOC_MB} МБ")
    rel_path = str(dest.relative_to(Path(settings.media_root)))

    version.original_filename = filename
    version.original_file_path = rel_path
    version.original_mime_type = file.content_type or "application/octet-stream"
    version.file_size = size
    version.preview_status = PreviewStatus.pending
    version.preview_data = None
    await db.commit()
    await db.refresh(version)
    await _enqueue("process_document_version", version.id)
    return DocumentVersionResponse.model_validate(version)


@router.put("/items/{item_id}/versions/{version_id}/pdf", response_model=DocumentVersionResponse)
async def replace_version_pdf(
    item_id: int,
    version_id: int,
    file: UploadFile = File(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    """Upload a manual PDF to use as preview (overrides auto-converted preview)."""
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    version = await _get_version(item_id, version_id, db)

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Ожидается PDF")

    dest = Path(settings.media_root) / "documents" / str(item_id) / str(version_id) / "preview" / "manual.pdf"
    size = await _save_upload(file, dest)
    if size > _MAX_DOC_MB * 1024 * 1024:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"Файл > {_MAX_DOC_MB} МБ")
    rel_path = str(dest.relative_to(Path(settings.media_root)))

    version.preview_data = {"type": "pdf", "path": rel_path}
    version.preview_status = PreviewStatus.ready
    await db.commit()
    await db.refresh(version)
    return DocumentVersionResponse.model_validate(version)


@router.put("/items/{item_id}/versions/{version_id}/source", response_model=DocumentVersionResponse)
async def replace_version_source(
    item_id: int,
    version_id: int,
    file: UploadFile = File(...),
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentVersionResponse:
    """Upload or replace the optional source file (docx/xlsx/pptx) for a version."""
    item = await _require_item(item_id, db)
    await check_section_write_access(item.section_id, current_user, db)
    version = await _get_version(item_id, version_id, db)

    content = await file.read()
    size = len(content)
    if size > _MAX_DOC_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Файл > {_MAX_DOC_MB} МБ")

    src_name = f"{uuid.uuid4().hex}-{file.filename or 'source'}"
    dest = Path(settings.media_root) / "documents" / str(item_id) / "source" / src_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)
    rel_path = str(dest.relative_to(Path(settings.media_root)))

    version.source_filename = file.filename or src_name
    version.source_file_path = rel_path
    version.source_file_size = size
    version.source_mime_type = file.content_type or "application/octet-stream"
    await db.commit()
    await db.refresh(version)
    return DocumentVersionResponse.model_validate(version)
