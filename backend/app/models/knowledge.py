import enum

from sqlalchemy import Boolean, Column, Computed, Date, DateTime, Enum, ForeignKey, Integer, String, Table, Text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Visibility(str, enum.Enum):
    public = "public"
    bpo_only = "bpo_only"


class ItemType(str, enum.Enum):
    article = "article"
    document = "document"
    link = "link"
    faq = "faq"


class ItemStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class PreviewStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    ready = "ready"
    failed = "failed"
    na = "na"  # PPTX — слайды загружаются вручную через ZIP


# ─── Association tables ───────────────────────────────────────────────────────

section_lawyers = Table(
    "section_lawyers",
    Base.metadata,
    Column("section_id", Integer, ForeignKey("sections.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

knowledge_item_tags = Table(
    "knowledge_item_tags",
    Base.metadata,
    Column("item_id", Integer, ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


# ─── Models ───────────────────────────────────────────────────────────────────

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("sections.id", ondelete="RESTRICT"), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    order_index = Column(Integer, nullable=False, default=0, server_default="0")
    visibility = Column(
        Enum(Visibility, name="knowledge_visibility"),
        nullable=False,
        default=Visibility.public,
        server_default=Visibility.public.value,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    parent = relationship("Section", remote_side=[id], backref="children")
    lawyers = relationship("User", secondary=section_lawyers, backref="owned_sections")
    items = relationship("KnowledgeItem", back_populates="section")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    color = Column(String(20), nullable=True)
    entity_type = Column(String(20), nullable=True)  # article|document|link|faq|None

    items = relationship("KnowledgeItem", secondary=knowledge_item_tags, back_populates="tags")


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    item_id = Column(Integer, ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="RESTRICT"), nullable=False)
    item_type = Column(Enum(ItemType, name="knowledge_item_type"), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    visibility = Column(
        Enum(Visibility, name="knowledge_visibility"),
        nullable=False,
        default=Visibility.public,
        server_default=Visibility.public.value,
    )
    status = Column(
        Enum(ItemStatus, name="knowledge_item_status"),
        nullable=False,
        default=ItemStatus.draft,
        server_default=ItemStatus.draft.value,
    )
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    content_text = Column(Text, nullable=True)
    search_vector = Column(
        TSVECTOR,
        Computed(
            "setweight(to_tsvector('russian', coalesce(title, '')), 'A') || "
            "setweight(to_tsvector('russian', coalesce(summary, '')), 'B') || "
            "setweight(to_tsvector('russian', coalesce(content_text, '')), 'C')",
            persisted=True,
        ),
        nullable=True,
    )

    section = relationship("Section", back_populates="items")
    author = relationship("User", foreign_keys=[author_id])
    tags = relationship("Tag", secondary=knowledge_item_tags, back_populates="items")
    article = relationship("Article", back_populates="item", uselist=False, cascade="all, delete-orphan")
    document = relationship("Document", back_populates="item", uselist=False, cascade="all, delete-orphan")


class Article(Base):
    __tablename__ = "articles"

    item_id = Column(Integer, ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True)
    content = Column(JSONB, nullable=True)        # TipTap JSON doc
    attachments = Column(JSONB, nullable=False, default=list, server_default="[]")
    toc_enabled = Column(Boolean, nullable=False, default=False, server_default="false")

    item = relationship("KnowledgeItem", back_populates="article")


class Document(Base):
    __tablename__ = "documents"

    item_id = Column(Integer, ForeignKey("knowledge_items.id", ondelete="CASCADE"), primary_key=True)

    item = relationship("KnowledgeItem", back_populates="document")
    versions = relationship(
        "DocumentVersion", back_populates="document",
        order_by="DocumentVersion.uploaded_at.desc()",
        cascade="all, delete-orphan",
    )


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.item_id", ondelete="CASCADE"), nullable=False)
    version_label = Column(String(100), nullable=False)
    effective_date = Column(Date, nullable=True)
    original_filename = Column(String(500), nullable=False)
    original_file_path = Column(String(1000), nullable=False)
    original_mime_type = Column(String(200), nullable=False)
    file_size = Column(Integer, nullable=False)
    preview_status = Column(
        Enum(PreviewStatus, name="preview_status"),
        nullable=False,
        default=PreviewStatus.pending,
        server_default=PreviewStatus.pending.value,
    )
    preview_data = Column(JSONB, nullable=True)   # {"type": "pdf"|"html"|"slides", ...}
    extracted_text = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    document = relationship("Document", back_populates="versions")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])
