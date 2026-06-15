from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.models.processes import (
    PmBuMode,
    PmBuType,
    PmImpact,
    PmMetricStatus,
    PmProcessType,
    PmStatus,
)


# ─── Shared base ──────────────────────────────────────────────────────────────


class _OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Reference tables ─────────────────────────────────────────────────────────


class PmRoleCreate(BaseModel):
    name: str
    description: str | None = None


class PmRoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class PmRoleResponse(_OrmBase):
    id: int
    name: str
    description: str | None
    created_at: datetime


# ---


class PmSystemCreate(BaseModel):
    name: str
    description: str | None = None
    type: str | None = None
    url: str | None = None


class PmSystemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    type: str | None = None
    url: str | None = None


class PmSystemResponse(_OrmBase):
    id: int
    name: str
    description: str | None
    type: str | None
    url: str | None
    created_at: datetime


# ---


class PmRegulationCreate(BaseModel):
    name: str
    description: str | None = None
    effective_date: date | None = None


class PmRegulationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    effective_date: date | None = None


class PmRegulationResponse(_OrmBase):
    id: int
    name: str
    description: str | None
    effective_date: date | None
    created_at: datetime


# ---


class PmPolicyCreate(BaseModel):
    name: str
    description: str | None = None


class PmPolicyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class PmPolicyResponse(_OrmBase):
    id: int
    name: str
    description: str | None
    created_at: datetime


# ---


class PmRiskCreate(BaseModel):
    name: str
    category: str | None = None
    description: str | None = None


class PmRiskUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None


class PmRiskResponse(_OrmBase):
    id: int
    name: str
    category: str | None
    description: str | None
    created_at: datetime


# ---


class PmDocTypeCreate(BaseModel):
    name: str
    description: str | None = None


class PmDocTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class PmDocTypeResponse(_OrmBase):
    id: int
    name: str
    description: str | None
    created_at: datetime


# ---


class PmBusinessUnitCreate(BaseModel):
    name: str
    type: PmBuType = PmBuType.client
    legal_partner_role_id: int | None = None


class PmBusinessUnitUpdate(BaseModel):
    name: str | None = None
    type: PmBuType | None = None
    legal_partner_role_id: int | None = None


class PmBusinessUnitResponse(_OrmBase):
    id: int
    name: str
    type: PmBuType
    legal_partner_role_id: int | None
    created_at: datetime


# ─── L2 Domain ────────────────────────────────────────────────────────────────


class PmDomainCreate(BaseModel):
    id: str
    name: str
    mission: str | None = None


class PmDomainUpdate(BaseModel):
    name: str | None = None
    mission: str | None = None


class PmDomainResponse(_OrmBase):
    id: str
    name: str
    mission: str | None
    created_at: datetime
    updated_at: datetime
    # Aggregated from processes (injected at query time)
    process_count: int = 0
    workflow_count: int = 0
    service_count: int = 0


# ─── L3 Process (schemas for M1, defined here for completeness) ───────────────


class PmSirporc(BaseModel):
    suppliers: list[str] = []
    inputs: list[str] = []
    input_requirements: list[str] = []
    process_summary: str = ""
    outputs: list[str] = []
    output_requirements: list[str] = []
    clients: list[str] = []


class PmProcessCreate(BaseModel):
    id: str
    name: str
    type: PmProcessType
    domain_id: str
    owner_role_id: int | None = None
    version: str = "1.0"
    status: PmStatus = PmStatus.draft
    lifecycle_ref_id: str | None = None
    last_updated: date | None = None
    next_review: date | None = None
    sirporc: dict[str, Any] | None = None
    bu_mode: PmBuMode = PmBuMode.all_clients
    connections: list[dict[str, Any]] = []
    changelog: list[dict[str, Any]] = []
    # Workflow-specific
    sla_days: int | None = None
    pain_points: list[str] | None = None
    # Service-specific
    required_competencies: list[str] | None = None
    effort_estimation: dict[str, Any] | None = None
    decision_points: list[dict[str, Any]] | None = None
    case_library: list[dict[str, Any]] | None = None
    improvement_candidates: list[dict[str, Any]] | None = None


class PmProcessUpdate(BaseModel):
    name: str | None = None
    domain_id: str | None = None
    owner_role_id: int | None = None
    version: str | None = None
    status: PmStatus | None = None
    lifecycle_ref_id: str | None = None
    last_updated: date | None = None
    next_review: date | None = None
    sirporc: dict[str, Any] | None = None
    bu_mode: PmBuMode | None = None
    connections: list[dict[str, Any]] | None = None
    changelog: list[dict[str, Any]] | None = None
    sla_days: int | None = None
    pain_points: list[str] | None = None
    required_competencies: list[str] | None = None
    effort_estimation: dict[str, Any] | None = None
    decision_points: list[dict[str, Any]] | None = None
    case_library: list[dict[str, Any]] | None = None
    improvement_candidates: list[dict[str, Any]] | None = None


class PmProcessResponse(_OrmBase):
    id: str
    name: str
    type: PmProcessType
    domain_id: str
    owner_role_id: int | None
    version: str
    status: PmStatus
    lifecycle_ref_id: str | None
    last_updated: date | None
    next_review: date | None
    sirporc: dict[str, Any] | None
    bu_mode: PmBuMode
    connections: list[Any] | None
    changelog: list[Any] | None
    sla_days: int | None
    pain_points: list[Any] | None
    bpmn_diagram: str | None
    required_competencies: list[Any] | None
    effort_estimation: dict[str, Any] | None
    decision_points: list[Any] | None
    case_library: list[Any] | None
    improvement_candidates: list[Any] | None
    created_at: datetime
    updated_at: datetime


# ─── L4 Activity (schemas for M2) ─────────────────────────────────────────────


class PmActivityCreate(BaseModel):
    id: str
    parent_process_id: str
    order_index: int
    name: str
    description: str | None = None
    is_optional: bool = False
    condition_note: str | None = None
    activity_type: str | None = None
    raci_role_id: int | None = None
    duration: str | None = None
    automation_potential: int | None = None
    data_operations: list[dict[str, Any]] | None = None
    decision_logic: list[dict[str, Any]] | None = None
    phase_number: int | None = None
    quality_criteria: list[str] | None = None


class PmActivityUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    order_index: int | None = None
    is_optional: bool | None = None
    condition_note: str | None = None
    activity_type: str | None = None
    raci_role_id: int | None = None
    duration: str | None = None
    automation_potential: int | None = None
    data_operations: list[dict[str, Any]] | None = None
    decision_logic: list[dict[str, Any]] | None = None
    phase_number: int | None = None
    quality_criteria: list[str] | None = None


class PmActivityResponse(_OrmBase):
    id: str
    parent_process_id: str
    order_index: int
    name: str
    description: str | None
    is_optional: bool
    condition_note: str | None
    activity_type: str | None
    raci_role_id: int | None
    duration: str | None
    automation_potential: int | None
    data_operations: list[Any] | None
    decision_logic: list[Any] | None
    phase_number: int | None
    quality_criteria: list[Any] | None
    created_at: datetime
    updated_at: datetime


# ─── L5 SOP (schemas for M2) ──────────────────────────────────────────────────


class PmSopCreate(BaseModel):
    id: str
    parent_activity_id: str
    title: str
    audience_role_id: int | None = None
    preconditions: list[str] = []
    steps: list[dict[str, Any]] = []
    checklist: list[str] = []
    faq: list[dict[str, Any]] = []
    related_docs: list[dict[str, Any]] = []
    changelog: list[dict[str, Any]] = []


class PmSopUpdate(BaseModel):
    title: str | None = None
    audience_role_id: int | None = None
    preconditions: list[str] | None = None
    steps: list[dict[str, Any]] | None = None
    checklist: list[str] | None = None
    faq: list[dict[str, Any]] | None = None
    related_docs: list[dict[str, Any]] | None = None
    changelog: list[dict[str, Any]] | None = None


class PmSopResponse(_OrmBase):
    id: str
    parent_activity_id: str
    title: str
    audience_role_id: int | None
    preconditions: list[Any] | None
    steps: list[Any] | None
    checklist: list[Any] | None
    faq: list[Any] | None
    related_docs: list[Any] | None
    changelog: list[Any] | None
    created_at: datetime
    updated_at: datetime


# ─── Landscape (utility response) ─────────────────────────────────────────────


class PmLandscapeDomain(BaseModel):
    id: str
    name: str
    mission: str | None
    workflow_count: int
    service_count: int
    process_count: int


class PmLandscapeResponse(BaseModel):
    domains: list[PmLandscapeDomain]
    total_domains: int
    total_processes: int


# ─── L3 Junction input schemas ────────────────────────────────────────────────


class PmBuAssignmentIn(BaseModel):
    bu_id: int
    notes: str | None = None


class PmSystemAssignmentIn(BaseModel):
    system_id: int


class PmRegulationAssignmentIn(BaseModel):
    reg_id: int
    articles: str | None = None
    relevance_note: str | None = None


class PmRiskAssignmentIn(BaseModel):
    risk_id: int
    impact: PmImpact | None = None
    probability: PmImpact | None = None
    control: str | None = None


class PmRaciRowIn(BaseModel):
    role_id: int
    activity_id: str | None = None
    r: bool = False
    a: bool = False
    c: bool = False
    i: bool = False


class PmMetricIn(BaseModel):
    name: str
    value: str | None = None
    unit: str | None = None
    metric_status: PmMetricStatus = PmMetricStatus.no_data


class PmAutomationCandidateIn(BaseModel):
    idea: str
    impact: str | None = None
    effort: str | None = None
    score: int | None = None


# ─── L3 Junction output schemas ───────────────────────────────────────────────


class PmBuAssignmentOut(BaseModel):
    bu_id: int
    bu_name: str
    bu_type: PmBuType
    notes: str | None = None


class PmSystemAssignmentOut(BaseModel):
    system_id: int
    system_name: str


class PmRegulationAssignmentOut(BaseModel):
    reg_id: int
    reg_name: str
    articles: str | None = None
    relevance_note: str | None = None


class PmRiskAssignmentOut(BaseModel):
    risk_id: int
    risk_name: str
    impact: PmImpact | None = None
    probability: PmImpact | None = None
    control: str | None = None


class PmRaciRowOut(BaseModel):
    role_id: int
    role_name: str
    activity_id: str | None = None
    r: bool
    a: bool
    c: bool
    i: bool


class PmMetricOut(_OrmBase):
    id: int
    name: str
    value: str | None
    unit: str | None
    metric_status: PmMetricStatus


class PmAutomationCandidateOut(_OrmBase):
    id: int
    idea: str
    impact: str | None
    effort: str | None
    score: int | None


# ─── L3 Process list item (lightweight, no junctions) ────────────────────────


class PmProcessListItem(_OrmBase):
    id: str
    name: str
    type: PmProcessType
    domain_id: str
    status: PmStatus
    version: str
    owner_role_id: int | None
    last_updated: date | None
    next_review: date | None
    created_at: datetime
    updated_at: datetime


# ─── L3 Process detail (base fields + all junction data) ─────────────────────


class PmProcessDetail(PmProcessResponse):
    business_units: list[PmBuAssignmentOut] = []
    systems: list[PmSystemAssignmentOut] = []
    regulations: list[PmRegulationAssignmentOut] = []
    risks: list[PmRiskAssignmentOut] = []
    raci: list[PmRaciRowOut] = []
    metrics: list[PmMetricOut] = []
    automation_candidates: list[PmAutomationCandidateOut] = []
    activity_count: int = 0
