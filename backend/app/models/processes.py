import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────


class PmStatus(str, enum.Enum):
    draft = "draft"
    as_is = "as_is"
    to_be = "to_be"


class PmProcessType(str, enum.Enum):
    workflow = "workflow"
    service = "service"


class PmBuMode(str, enum.Enum):
    all_clients = "all_clients"
    specific = "specific"


class PmActivityType(str, enum.Enum):
    manual = "manual"
    system = "system"
    decision = "decision"


class PmImpact(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class PmMetricStatus(str, enum.Enum):
    fact = "fact"
    estimate = "estimate"
    no_data = "no_data"


class PmBuType(str, enum.Enum):
    client = "client"
    selfbu = "self"  # DB value is "self"; "selfbu" avoids conflict with Python keyword
    oversight = "oversight"


# ─── Reference Tables ─────────────────────────────────────────────────────────


class PmRole(Base):
    __tablename__ = "pm_roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmSystem(Base):
    __tablename__ = "pm_systems"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str | None] = mapped_column(String(50))
    url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmRegulation(Base):
    __tablename__ = "pm_regulations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    effective_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmPolicy(Base):
    __tablename__ = "pm_policies"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmRisk(Base):
    __tablename__ = "pm_risks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    category: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmDocType(Base):
    __tablename__ = "pm_doc_types"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PmBusinessUnit(Base):
    __tablename__ = "pm_business_units"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    type: Mapped[PmBuType] = mapped_column(
        Enum(PmBuType, values_callable=lambda e: [m.value for m in e], name="pm_bu_type", create_type=False),
        nullable=False,
        default=PmBuType.client,
    )
    legal_partner_role_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("pm_roles.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


# ─── L2 Domain ────────────────────────────────────────────────────────────────


class PmDomain(Base):
    __tablename__ = "pm_domains"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mission: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ─── L4 Activity (defined before L3 junction tables that reference it) ────────


class PmActivity(Base):
    __tablename__ = "pm_activities"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    parent_process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), nullable=False
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_optional: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    condition_note: Mapped[str | None] = mapped_column(Text)
    # Workflow-specific
    activity_type: Mapped[PmActivityType | None] = mapped_column(Enum(PmActivityType, name="pm_activity_type", create_type=False))
    raci_role_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("pm_roles.id", ondelete="SET NULL")
    )
    duration: Mapped[str | None] = mapped_column(String(50))
    automation_potential: Mapped[int | None] = mapped_column(Integer)
    data_operations: Mapped[list | None] = mapped_column(JSONB)
    decision_logic: Mapped[list | None] = mapped_column(JSONB)
    # Service-specific
    phase_number: Mapped[int | None] = mapped_column(Integer)
    quality_criteria: Mapped[list | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ─── L3 Process ───────────────────────────────────────────────────────────────


class PmProcess(Base):
    __tablename__ = "pm_processes"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[PmProcessType] = mapped_column(Enum(PmProcessType, name="pm_process_type", create_type=False), nullable=False)
    domain_id: Mapped[str] = mapped_column(
        String(20), ForeignKey("pm_domains.id", ondelete="RESTRICT"), nullable=False
    )
    owner_role_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("pm_roles.id", ondelete="SET NULL")
    )
    version: Mapped[str] = mapped_column(String(10), nullable=False, default="1.0")
    status: Mapped[PmStatus] = mapped_column(
        Enum(PmStatus, name="pm_status", create_type=False), nullable=False, default=PmStatus.draft
    )
    lifecycle_ref_id: Mapped[str | None] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="SET NULL")
    )
    last_updated: Mapped[date | None] = mapped_column(Date)
    next_review: Mapped[date | None] = mapped_column(Date)
    sirporc: Mapped[dict | None] = mapped_column(JSONB, server_default=text("'{}'::jsonb"))
    bu_mode: Mapped[PmBuMode] = mapped_column(
        Enum(PmBuMode, name="pm_bu_mode", create_type=False), nullable=False, default=PmBuMode.all_clients
    )
    connections: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    changelog: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    # Workflow-specific
    sla_days: Mapped[int | None] = mapped_column(Integer)
    pain_points: Mapped[list | None] = mapped_column(JSONB)
    bpmn_diagram: Mapped[str | None] = mapped_column(Text)  # reserved, always null
    # Service-specific
    required_competencies: Mapped[list | None] = mapped_column(JSONB)
    effort_estimation: Mapped[dict | None] = mapped_column(JSONB)
    decision_points: Mapped[list | None] = mapped_column(JSONB)
    case_library: Mapped[list | None] = mapped_column(JSONB)
    improvement_candidates: Mapped[list | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ─── L5 SOP ───────────────────────────────────────────────────────────────────


class PmSop(Base):
    __tablename__ = "pm_sops"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    parent_activity_id: Mapped[str] = mapped_column(
        String(60), ForeignKey("pm_activities.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    audience_role_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("pm_roles.id", ondelete="SET NULL")
    )
    preconditions: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    steps: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    checklist: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    faq: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    related_docs: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))
    changelog: Mapped[list | None] = mapped_column(JSONB, server_default=text("'[]'::jsonb"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ─── Junction Tables for L3 ───────────────────────────────────────────────────


class PmProcessBusinessUnit(Base):
    __tablename__ = "pm_process_business_units"

    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), primary_key=True
    )
    bu_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pm_business_units.id", ondelete="CASCADE"), primary_key=True
    )
    notes: Mapped[str | None] = mapped_column(Text)


class PmProcessSystem(Base):
    __tablename__ = "pm_process_systems"

    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), primary_key=True
    )
    system_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pm_systems.id", ondelete="CASCADE"), primary_key=True
    )


class PmProcessRegulation(Base):
    __tablename__ = "pm_process_regulations"

    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), primary_key=True
    )
    reg_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pm_regulations.id", ondelete="CASCADE"), primary_key=True
    )
    articles: Mapped[str | None] = mapped_column(Text)
    relevance_note: Mapped[str | None] = mapped_column(Text)


class PmProcessRisk(Base):
    __tablename__ = "pm_process_risks"

    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), primary_key=True
    )
    risk_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pm_risks.id", ondelete="CASCADE"), primary_key=True
    )
    impact: Mapped[PmImpact | None] = mapped_column(Enum(PmImpact, name="pm_impact", create_type=False))
    probability: Mapped[PmImpact | None] = mapped_column(Enum(PmImpact, name="pm_impact", create_type=False))
    control: Mapped[str | None] = mapped_column(Text)


class PmProcessRaci(Base):
    __tablename__ = "pm_process_raci"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), nullable=False
    )
    role_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pm_roles.id", ondelete="CASCADE"), nullable=False
    )
    activity_id: Mapped[str | None] = mapped_column(
        String(60), ForeignKey("pm_activities.id", ondelete="CASCADE")
    )
    r: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    a: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    c: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    i: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class PmProcessMetric(Base):
    __tablename__ = "pm_process_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str | None] = mapped_column(String(100))
    unit: Mapped[str | None] = mapped_column(String(50))
    metric_status: Mapped[PmMetricStatus] = mapped_column(
        Enum(PmMetricStatus, name="pm_metric_status", create_type=False), nullable=False, default=PmMetricStatus.no_data
    )


class PmAutomationCandidate(Base):
    __tablename__ = "pm_automation_candidates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("pm_processes.id", ondelete="CASCADE"), nullable=False
    )
    idea: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[str | None] = mapped_column(String(50))
    effort: Mapped[str | None] = mapped_column(String(50))
    score: Mapped[int | None] = mapped_column(Integer)
