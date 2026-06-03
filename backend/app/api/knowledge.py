from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import UserContext, check_section_write_access, get_current_user, require_role
from app.services.knowledge.search import build_search_conditions, search_rank, translate_layout
from app.models.knowledge import (
    ItemStatus,
    KnowledgeItem,
    Section,
    Tag,
    UserFavorite,
    Visibility,
    knowledge_item_tags,
)
from app.models.user import UserRole
from app.schemas.knowledge import (
    KnowledgeItemCreate,
    KnowledgeItemListResponse,
    KnowledgeItemResponse,
    KnowledgeItemUpdate,
    SectionCreate,
    SectionDetailResponse,
    SectionResponse,
    SectionUpdate,
    TagCreate,
    TagResponse,
    TypeaheadItem,
    TypeaheadResponse,
    TypeaheadSection,
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
    current_user: UserContext = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TagResponse]:
    result = await db.execute(
        select(Tag, func.count(knowledge_item_tags.c.item_id).label("item_count"))
        .outerjoin(knowledge_item_tags, knowledge_item_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(Tag.name)
    )
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
