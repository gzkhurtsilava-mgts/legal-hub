import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text
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

    section = relationship("Section", back_populates="items")
    author = relationship("User", foreign_keys=[author_id])
    tags = relationship("Tag", secondary=knowledge_item_tags, back_populates="items")
