from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.knowledge import ItemStatus, ItemType, Visibility


# ─── Tags ─────────────────────────────────────────────────────────────────────

class TagCreate(BaseModel):
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100)
    color: str | None = None


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    color: str | None
    entity_type: str | None = None
    item_count: int = 0


# ─── Sections ─────────────────────────────────────────────────────────────────

class SectionCreate(BaseModel):
    parent_id: int | None = None
    name: str = Field(max_length=255)
    slug: str = Field(max_length=255)
    description: str | None = None
    icon: str | None = None
    order_index: int = 0
    visibility: Visibility = Visibility.public


class SectionUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    slug: str | None = Field(None, max_length=255)
    description: str | None = None
    icon: str | None = None
    order_index: int | None = None
    visibility: Visibility | None = None


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    parent_id: int | None
    name: str
    slug: str
    description: str | None
    icon: str | None
    order_index: int
    visibility: Visibility
    created_at: datetime
    updated_at: datetime
    item_count: int = 0


class SectionDetailResponse(SectionResponse):
    children: list[SectionResponse] = []


# ─── Items ────────────────────────────────────────────────────────────────────

class KnowledgeItemCreate(BaseModel):
    section_id: int
    item_type: ItemType
    title: str = Field(max_length=500)
    summary: str | None = None
    visibility: Visibility = Visibility.public
    tag_ids: list[int] = []


class KnowledgeItemUpdate(BaseModel):
    section_id: int | None = None
    title: str | None = Field(None, max_length=500)
    summary: str | None = None
    visibility: Visibility | None = None
    tag_ids: list[int] | None = None


class KnowledgeItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    section_id: int
    item_type: ItemType
    title: str
    summary: str | None
    visibility: Visibility
    status: ItemStatus
    author_id: int | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    tags: list[TagResponse] = []
    is_favorite: bool = False


class KnowledgeItemListResponse(BaseModel):
    items: list[KnowledgeItemResponse]
    total: int
    skip: int
    limit: int


# ─── Articles ─────────────────────────────────────────────────────────────────

class AttachmentMeta(BaseModel):
    filename: str
    path: str
    size: int
    mime_type: str


class ArticleContent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    content: dict | None = None        # TipTap JSON
    attachments: list[AttachmentMeta] = []
    toc_enabled: bool = False


class ArticleContentUpdate(BaseModel):
    content: dict | None = None
    toc_enabled: bool = False


class UploadedFile(BaseModel):
    url: str
    filename: str
    size: int
    mime_type: str


# ─── Typeahead ────────────────────────────────────────────────────────────────

class TypeaheadSection(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    visibility: Visibility


class TypeaheadItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    item_type: ItemType
    section_id: int


class TypeaheadResponse(BaseModel):
    sections: list[TypeaheadSection]
    items: list[TypeaheadItem]
