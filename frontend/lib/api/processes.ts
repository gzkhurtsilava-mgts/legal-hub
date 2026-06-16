"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiFetch } from "./client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PmStatus = "draft" | "as_is" | "to_be";
export type PmProcessType = "workflow" | "service";
export type PmBuType = "client" | "self" | "oversight";

// ─── Reference table types ─────────────────────────────────────────────────────

export type RefTable =
  | "roles"
  | "systems"
  | "regulations"
  | "policies"
  | "risks"
  | "doc-types"
  | "business-units";

export interface PmRole {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PmSystem {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  url: string | null;
  created_at: string;
}

export interface PmRegulation {
  id: number;
  name: string;
  description: string | null;
  effective_date: string | null;
  created_at: string;
}

export interface PmPolicy {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PmRisk {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface PmDocType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PmBusinessUnit {
  id: number;
  name: string;
  type: PmBuType;
  legal_partner_role_id: number | null;
  created_at: string;
}

// ─── Domain ───────────────────────────────────────────────────────────────────

export interface PmDomain {
  id: string;
  name: string;
  mission: string | null;
  created_at: string;
  updated_at: string;
  process_count: number;
  workflow_count: number;
  service_count: number;
}

export interface PmDomainCreate {
  id: string;
  name: string;
  mission?: string;
}

export interface PmDomainUpdate {
  name?: string;
  mission?: string | null;
}

// ─── Landscape ────────────────────────────────────────────────────────────────

export interface PmLandscapeDomain {
  id: string;
  name: string;
  mission: string | null;
  workflow_count: number;
  service_count: number;
  process_count: number;
}

export interface PmLandscape {
  domains: PmLandscapeDomain[];
  total_domains: number;
  total_processes: number;
}

// ─── Generic ref hooks ─────────────────────────────────────────────────────────

function useToken() {
  const { data: session } = useSession();
  return (session as { accessToken?: string })?.accessToken;
}

export function useRefList<T>(table: RefTable, q?: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<T[]>({
    queryKey: ["pm-refs", table, q ?? ""],
    queryFn: () => {
      const url = q
        ? `/api/processes/refs/${table}/?q=${encodeURIComponent(q)}`
        : `/api/processes/refs/${table}/`;
      return apiFetch<T[]>(url, token);
    },
    enabled: !!session,
  });
}

export function useCreateRef<T>(table: RefTable) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      apiFetch<T>(`/api/processes/refs/${table}/`, token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-refs", table] }),
  });
}

export function useUpdateRef<T>(table: RefTable, id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: (body) =>
      apiFetch<T>(`/api/processes/refs/${table}/${id}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-refs", table] }),
  });
}

export function useDeleteRef(table: RefTable, id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch<void>(`/api/processes/refs/${table}/${id}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-refs", table] }),
  });
}

// ─── Domain hooks ─────────────────────────────────────────────────────────────

export function useDomains() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmDomain[]>({
    queryKey: ["pm-domains"],
    queryFn: () => apiFetch<PmDomain[]>("/api/processes/domains/", token),
    enabled: !!session,
  });
}

export function useDomain(id: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmDomain>({
    queryKey: ["pm-domain", id],
    queryFn: () => apiFetch<PmDomain>(`/api/processes/domains/${id}`, token),
    enabled: !!session && !!id,
  });
}

export function useCreateDomain() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmDomain, Error, PmDomainCreate>({
    mutationFn: (body) =>
      apiFetch<PmDomain>("/api/processes/domains/", token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-domains"] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

export function useUpdateDomain(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmDomain, Error, PmDomainUpdate>({
    mutationFn: (body) =>
      apiFetch<PmDomain>(`/api/processes/domains/${id}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-domains"] });
      qc.invalidateQueries({ queryKey: ["pm-domain", id] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

export function useDeleteDomain(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch<void>(`/api/processes/domains/${id}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-domains"] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

export function useLandscape() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmLandscape>({
    queryKey: ["pm-landscape"],
    queryFn: () => apiFetch<PmLandscape>("/api/processes/landscape", token),
    enabled: !!session,
  });
}

// ─── L3 Process types ─────────────────────────────────────────────────────────

export type PmBuMode = "all_clients" | "specific";
export type PmImpact = "high" | "medium" | "low";
export type PmMetricStatus = "fact" | "estimate" | "no_data";

export interface PmSirporc {
  suppliers: string[];
  inputs: string[];
  input_requirements: string[];
  process_summary: string;
  outputs: string[];
  output_requirements: string[];
  clients: string[];
}

export interface PmProcessListItem {
  id: string;
  name: string;
  type: PmProcessType;
  domain_id: string;
  status: PmStatus;
  version: string;
  owner_role_id: number | null;
  last_updated: string | null;
  next_review: string | null;
  created_at: string;
  updated_at: string;
}

export interface PmBuAssignmentOut {
  bu_id: number;
  bu_name: string;
  bu_type: PmBuType;
  notes: string | null;
}

export interface PmSystemAssignmentOut {
  system_id: number;
  system_name: string;
}

export interface PmRegulationAssignmentOut {
  reg_id: number;
  reg_name: string;
  articles: string | null;
  relevance_note: string | null;
}

export interface PmRiskAssignmentOut {
  risk_id: number;
  risk_name: string;
  impact: PmImpact | null;
  probability: PmImpact | null;
  control: string | null;
}

export interface PmRaciRowOut {
  role_id: number;
  role_name: string;
  activity_id: string | null;
  r: boolean;
  a: boolean;
  c: boolean;
  i: boolean;
}

export interface PmMetricOut {
  id: number;
  name: string;
  value: string | null;
  unit: string | null;
  metric_status: PmMetricStatus;
}

export interface PmAutomationCandidateOut {
  id: number;
  idea: string;
  impact: string | null;
  effort: string | null;
  score: number | null;
}

export interface PmProcessDetail {
  id: string;
  name: string;
  type: PmProcessType;
  domain_id: string;
  owner_role_id: number | null;
  version: string;
  status: PmStatus;
  lifecycle_ref_id: string | null;
  last_updated: string | null;
  next_review: string | null;
  sirporc: PmSirporc | null;
  bu_mode: PmBuMode;
  connections: Array<{ direction: string; target_process_id: string; note: string }> | null;
  changelog: Array<{ date: string; author: string; note: string }> | null;
  sla_days: number | null;
  pain_points: string[] | null;
  bpmn_diagram: string | null;
  required_competencies: string[] | null;
  effort_estimation: { simple: string; medium: string; complex: string; factors: string[] } | null;
  decision_points: Array<{ decision: string; factors: string[] }> | null;
  case_library: Array<{ case_id: string; title: string; year: number | null; effort: string; author: string; lessons: string[]; ref_to_template: string }> | null;
  improvement_candidates: Array<{ idea: string; type: string; impact: string; effort: string; score: number }> | null;
  created_at: string;
  updated_at: string;
  business_units: PmBuAssignmentOut[];
  systems: PmSystemAssignmentOut[];
  regulations: PmRegulationAssignmentOut[];
  risks: PmRiskAssignmentOut[];
  raci: PmRaciRowOut[];
  metrics: PmMetricOut[];
  automation_candidates: PmAutomationCandidateOut[];
  activity_count: number;
}

export interface PmProcessCreate {
  id: string;
  name: string;
  type: PmProcessType;
  domain_id: string;
  owner_role_id?: number | null;
  version?: string;
  status?: PmStatus;
}

export interface PmProcessUpdate {
  name?: string;
  domain_id?: string;
  owner_role_id?: number | null;
  version?: string;
  status?: PmStatus;
  lifecycle_ref_id?: string | null;
  last_updated?: string | null;
  next_review?: string | null;
  sirporc?: PmSirporc | null;
  bu_mode?: PmBuMode;
  connections?: Array<{ direction: string; target_process_id: string; note: string }> | null;
  changelog?: Array<{ date: string; author: string; note: string }> | null;
  sla_days?: number | null;
  pain_points?: string[] | null;
  required_competencies?: string[] | null;
  effort_estimation?: object | null;
  decision_points?: object[] | null;
  case_library?: object[] | null;
  improvement_candidates?: object[] | null;
}

// ─── L3 Process hooks ─────────────────────────────────────────────────────────

export function useProcesses(filters?: {
  domain_id?: string;
  type?: string;
  status?: string;
  q?: string;
}) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmProcessListItem[]>({
    queryKey: ["pm-processes", filters ?? {}],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.domain_id) params.set("domain_id", filters.domain_id);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.q) params.set("q", filters.q);
      const qs = params.toString();
      return apiFetch<PmProcessListItem[]>(`/api/processes/${qs ? "?" + qs : ""}`, token);
    },
    enabled: !!session,
  });
}

export function useProcess(id: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmProcessDetail>({
    queryKey: ["pm-process", id],
    queryFn: () => apiFetch<PmProcessDetail>(`/api/processes/${id}`, token),
    enabled: !!session && !!id,
  });
}

export function useCreateProcess() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmProcessDetail, Error, PmProcessCreate>({
    mutationFn: (body) =>
      apiFetch<PmProcessDetail>("/api/processes/", token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["pm-processes"] });
      qc.invalidateQueries({ queryKey: ["pm-domain", data.domain_id] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

export function useUpdateProcess(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmProcessDetail, Error, PmProcessUpdate>({
    mutationFn: (body) =>
      apiFetch<PmProcessDetail>(`/api/processes/${id}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["pm-process", id] });
      qc.invalidateQueries({ queryKey: ["pm-processes"] });
      qc.invalidateQueries({ queryKey: ["pm-domain", data.domain_id] });
    },
  });
}

export function useDeleteProcess(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch<void>(`/api/processes/${id}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["pm-process", id] });
      qc.invalidateQueries({ queryKey: ["pm-processes"] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

// ─── Junction hooks ───────────────────────────────────────────────────────────

export function useUpdateProcessJunction(processId: string, junction: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<{ ok: boolean }, Error, unknown[]>({
    mutationFn: (body) =>
      apiFetch<{ ok: boolean }>(`/api/processes/${processId}/${junction}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-process", processId] }),
  });
}

export function useCreateToBe(processId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmProcessDetail, Error, void>({
    mutationFn: () =>
      apiFetch<PmProcessDetail>(`/api/processes/${processId}/create-to-be`, token, {
        method: "POST",
        body: "{}",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-process", processId] });
      qc.invalidateQueries({ queryKey: ["pm-processes"] });
      qc.invalidateQueries({ queryKey: ["pm-landscape"] });
    },
  });
}

export function useNextProcessId(domain: string, type: string, enabled: boolean) {
  const token = useToken();
  return useQuery<{ suggested_id: string }>({
    queryKey: ["pm-next-id", domain, type],
    queryFn: () =>
      apiFetch<{ suggested_id: string }>(
        `/api/processes/next-id?domain=${encodeURIComponent(domain)}&type=${type}`,
        token
      ),
    enabled: enabled && !!domain && !!type,
    staleTime: 0,
  });
}

// ─── L4 Activity types ────────────────────────────────────────────────────────

export type PmActivityType = "manual" | "system" | "decision";

export interface PmDataOperation {
  operation: "read" | "create";
  data: string;
  source_target: string;
}

export interface PmDecisionBranch {
  question: string;
  branch_yes: string;
  branch_no: string;
}

export interface PmActivity {
  id: string;
  parent_process_id: string;
  order_index: number;
  name: string;
  description: string | null;
  is_optional: boolean;
  condition_note: string | null;
  activity_type: PmActivityType | null;
  raci_role_id: number | null;
  duration: string | null;
  automation_potential: number | null;
  data_operations: PmDataOperation[] | null;
  decision_logic: PmDecisionBranch[] | null;
  phase_number: number | null;
  quality_criteria: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PmActivityCreate {
  id: string;
  parent_process_id: string;
  order_index: number;
  name: string;
  description?: string | null;
  is_optional?: boolean;
  condition_note?: string | null;
  activity_type?: PmActivityType | null;
  raci_role_id?: number | null;
  duration?: string | null;
  automation_potential?: number | null;
  data_operations?: PmDataOperation[] | null;
  decision_logic?: PmDecisionBranch[] | null;
  phase_number?: number | null;
  quality_criteria?: string[] | null;
}

export interface PmActivityUpdate {
  name?: string;
  description?: string | null;
  order_index?: number;
  is_optional?: boolean;
  condition_note?: string | null;
  activity_type?: PmActivityType | null;
  raci_role_id?: number | null;
  duration?: string | null;
  automation_potential?: number | null;
  data_operations?: PmDataOperation[] | null;
  decision_logic?: PmDecisionBranch[] | null;
  phase_number?: number | null;
  quality_criteria?: string[] | null;
}

// ─── L5 SOP types ─────────────────────────────────────────────────────────────

export interface PmSopStep {
  title: string;
  substeps: string[];
  tips: string[];
  warnings: string[];
}

export interface PmSopFaq {
  question: string;
  answer: string;
}

export interface PmSop {
  id: string;
  parent_activity_id: string;
  title: string;
  audience_role_id: number | null;
  preconditions: string[] | null;
  steps: PmSopStep[] | null;
  checklist: string[] | null;
  faq: PmSopFaq[] | null;
  related_docs: Array<{ title: string; ref: string }> | null;
  changelog: Array<{ date: string; author: string; note: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface PmSopCreate {
  id: string;
  parent_activity_id: string;
  title: string;
  audience_role_id?: number | null;
  preconditions?: string[];
  steps?: PmSopStep[];
  checklist?: string[];
  faq?: PmSopFaq[];
  related_docs?: Array<{ title: string; ref: string }>;
  changelog?: Array<{ date: string; author: string; note: string }>;
}

export interface PmSopUpdate {
  title?: string;
  audience_role_id?: number | null;
  preconditions?: string[] | null;
  steps?: PmSopStep[] | null;
  checklist?: string[] | null;
  faq?: PmSopFaq[] | null;
  related_docs?: Array<{ title: string; ref: string }> | null;
  changelog?: Array<{ date: string; author: string; note: string }> | null;
}

// ─── L4 Activity hooks ────────────────────────────────────────────────────────

export function useActivities(processId: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmActivity[]>({
    queryKey: ["pm-activities", processId],
    queryFn: () => apiFetch<PmActivity[]>(`/api/processes/${processId}/activities/`, token),
    enabled: !!session && !!processId,
  });
}

export function useActivity(processId: string, activityId: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmActivity>({
    queryKey: ["pm-activity", processId, activityId],
    queryFn: () => apiFetch<PmActivity>(`/api/processes/${processId}/activities/${activityId}`, token),
    enabled: !!session && !!processId && !!activityId,
  });
}

export function useCreateActivity(processId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmActivity, Error, PmActivityCreate>({
    mutationFn: (body) =>
      apiFetch<PmActivity>(`/api/processes/${processId}/activities/`, token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-activities", processId] });
      qc.invalidateQueries({ queryKey: ["pm-process", processId] });
    },
  });
}

export function useUpdateActivity(processId: string, activityId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmActivity, Error, PmActivityUpdate>({
    mutationFn: (body) =>
      apiFetch<PmActivity>(`/api/processes/${processId}/activities/${activityId}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-activity", processId, activityId] });
      qc.invalidateQueries({ queryKey: ["pm-activities", processId] });
    },
  });
}

export function useDeleteActivity(processId: string, activityId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch<void>(`/api/processes/${processId}/activities/${activityId}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-activities", processId] });
      qc.invalidateQueries({ queryKey: ["pm-process", processId] });
    },
  });
}

export function useReorderActivities(processId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<{ ok: boolean }, Error, Array<{ id: string; order_index: number }>>({
    mutationFn: (body) =>
      apiFetch<{ ok: boolean }>(`/api/processes/${processId}/activities/reorder`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-activities", processId] }),
  });
}

export function useNextActivityId(processId: string, optional: boolean, enabled: boolean) {
  const token = useToken();
  return useQuery<{ suggested_id: string }>({
    queryKey: ["pm-next-activity-id", processId, optional],
    queryFn: () =>
      apiFetch<{ suggested_id: string }>(
        `/api/processes/next-activity-id?process_id=${encodeURIComponent(processId)}&optional=${optional}`,
        token
      ),
    enabled: enabled && !!processId,
    staleTime: 0,
  });
}

// ─── L5 SOP hooks ─────────────────────────────────────────────────────────────

export function useSops(processId: string, activityId: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmSop[]>({
    queryKey: ["pm-sops", processId, activityId],
    queryFn: () =>
      apiFetch<PmSop[]>(`/api/processes/${processId}/activities/${activityId}/sops/`, token),
    enabled: !!session && !!processId && !!activityId,
  });
}

export function useSop(processId: string, activityId: string, sopId: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<PmSop>({
    queryKey: ["pm-sop", processId, activityId, sopId],
    queryFn: () =>
      apiFetch<PmSop>(`/api/processes/${processId}/activities/${activityId}/sops/${sopId}`, token),
    enabled: !!session && !!processId && !!activityId && !!sopId,
  });
}

export function useCreateSop(processId: string, activityId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmSop, Error, PmSopCreate>({
    mutationFn: (body) =>
      apiFetch<PmSop>(`/api/processes/${processId}/activities/${activityId}/sops/`, token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-sops", processId, activityId] }),
  });
}

export function useUpdateSop(processId: string, activityId: string, sopId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<PmSop, Error, PmSopUpdate>({
    mutationFn: (body) =>
      apiFetch<PmSop>(`/api/processes/${processId}/activities/${activityId}/sops/${sopId}`, token, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pm-sop", processId, activityId, sopId] });
      qc.invalidateQueries({ queryKey: ["pm-sops", processId, activityId] });
    },
  });
}

export function useDeleteSop(processId: string, activityId: string, sopId: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch<void>(`/api/processes/${processId}/activities/${activityId}/sops/${sopId}`, token, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pm-sops", processId, activityId] }),
  });
}
