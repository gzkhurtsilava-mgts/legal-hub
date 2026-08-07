"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiDownload, apiFetch } from "./client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AuthorityKind = "deal" | "representation" | "action";
export type DealDirection = "expense" | "income" | "na";
export type AuthorityStatus = "draft" | "active" | "archived";
export type ScopeType = "metablock" | "block" | "department" | "division" | "unit";
export type OrgSource = "manual" | "hrgate";
export type GrantDerivation = "base_rule" | "cascade" | "manual_exception";
export type ResolvedDerivation =
  | "base_rule"
  | "cascade"
  | "universal"
  | "manual_exception";
export type LevelSource = "manual" | "derived" | "hr";
export type CertificateType = "paper" | "notarial" | "mchd";
export type CertificateStatus = "active" | "revoked" | "expired";
export type IssueMethod = "in_person" | "ring_mail" | "postal";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthorityCategory {
  id: number;
  parent_id: number | null;
  level: number;
  name: string;
  sort_order: number;
}

export interface Authority {
  id: number;
  code: string;
  category_id: number;
  name_short: string;
  text_full: string;
  authority_kind: AuthorityKind;
  deal_direction: DealDirection;
  is_universal: boolean;
  limit_applies: boolean;
  is_no_limit: boolean;
  legal_basis: string | null;
  status: AuthorityStatus;
  version: number;
  valid_from: string | null;
  valid_to: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgScope {
  id: number;
  parent_id: number | null;
  scope_type: ScopeType;
  name: string;
  company: string;
  source: OrgSource;
  external_id: string | null;
  created_at: string;
}

export interface OrgLevel {
  id: number;
  code: string;
  rank: number;
}

export interface LimitRule {
  id: number;
  org_level_id: number;
  amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorityGrant {
  id: number;
  authority_id: number;
  org_scope_id: number | null;
  granted: boolean;
  derivation: GrantDerivation;
  created_at: string;
  updated_at: string;
}

export interface ResolvedGrant {
  id: number;
  org_scope_id: number | null;
  org_level_id: number;
  authority_id: number;
  granted: boolean;
  effective_limit: string | null;
  no_limit: boolean;
  unlimited: boolean;
  currency: string | null;
  derivation: ResolvedDerivation;
  source_grant_id: number | null;
  generated_at: string;
}

export interface Employee {
  id: number;
  fio: string;
  position: string | null;
  company: string;
  org_scope_id: number | null;
  org_level_id: number | null;
  level_source: LevelSource;
  tab_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorityRef {
  id: number;
  code: string;
  name_short: string;
}

export interface OriginalIssue {
  id: number;
  certificate_id: number;
  recipient_fio: string;
  issued_date: string;
  method: IssueMethod;
  confirmed: boolean;
  confirmation_note: string | null;
  created_at: string;
}

export interface Certificate {
  id: number;
  number: string;
  grantor_company: string;
  grantee_employee_id: number | null;
  grantee_fio: string;
  grantee_position: string | null;
  grantee_tab_number: string | null;
  cert_type: CertificateType;
  issued_date: string;
  valid_to: string | null;
  limits: Record<string, unknown> | null;
  signer: string | null;
  registration_data: string | null;
  scan_path: string | null;
  basis_request_id: number | null;
  status: CertificateStatus;
  authorities: AuthorityRef[];
  created_at: string;
  updated_at: string;
}

export interface ResolvedAuthorityOut {
  authority_id: number | null;
  code: string | null;
  name_short: string | null;
  granted: boolean;
  effective_limit: string | null;
  no_limit: boolean;
  unlimited: boolean;
  currency: string | null;
  derivation: ResolvedDerivation;
  proposed_text: string | null;
}

export interface ResolveResponse {
  employee_id: number;
  org_scope_id: number | null;
  org_level_id: number | null;
  authorities: ResolvedAuthorityOut[];
}

// ─── Token helper ─────────────────────────────────────────────────────────────

function useToken() {
  const { data: session } = useSession();
  return (session as { accessToken?: string })?.accessToken;
}

const B = "/api/poa";
type Body = Record<string, unknown>;

// ─── Categories ────────────────────────────────────────────────────────────

export function useCategories() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<AuthorityCategory[]>({
    queryKey: ["poa-categories"],
    queryFn: () => apiFetch<AuthorityCategory[]>(`${B}/categories/`, token),
    enabled: !!session,
  });
}

export function useCreateCategory() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<AuthorityCategory, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/categories/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-categories"] }),
  });
}

export function useUpdateCategory(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<AuthorityCategory, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/categories/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-categories"] }),
  });
}

export function useDeleteCategory(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/categories/${id}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-categories"] }),
  });
}

// ─── Authorities ─────────────────────────────────────────────────────────────

export function useAuthorities(categoryId?: number) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<Authority[]>({
    queryKey: ["poa-authorities", categoryId ?? null],
    queryFn: () =>
      apiFetch<Authority[]>(
        categoryId ? `${B}/authorities/?category_id=${categoryId}` : `${B}/authorities/`,
        token
      ),
    enabled: !!session,
  });
}

export function useCreateAuthority() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Authority, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/authorities/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-authorities"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useUpdateAuthority(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Authority, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/authorities/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-authorities"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useDeleteAuthority(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/authorities/${id}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-authorities"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

// ─── Org scopes ──────────────────────────────────────────────────────────────

export function useOrgScopes(company?: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<OrgScope[]>({
    queryKey: ["poa-org-scopes", company ?? null],
    queryFn: () =>
      apiFetch<OrgScope[]>(
        company ? `${B}/org-scopes/?company=${encodeURIComponent(company)}` : `${B}/org-scopes/`,
        token
      ),
    enabled: !!session,
  });
}

export function useCreateOrgScope() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<OrgScope, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/org-scopes/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-org-scopes"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useUpdateOrgScope(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<OrgScope, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/org-scopes/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-org-scopes"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useDeleteOrgScope(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/org-scopes/${id}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-org-scopes"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

// ─── Org levels ──────────────────────────────────────────────────────────────

export function useOrgLevels() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<OrgLevel[]>({
    queryKey: ["poa-org-levels"],
    queryFn: () => apiFetch<OrgLevel[]>(`${B}/org-levels/`, token),
    enabled: !!session,
  });
}

export function useCreateOrgLevel() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<OrgLevel, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/org-levels/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-org-levels"] }),
  });
}

export function useUpdateOrgLevel(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<OrgLevel, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/org-levels/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-org-levels"] }),
  });
}

export function useDeleteOrgLevel(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/org-levels/${id}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-org-levels"] }),
  });
}

// ─── Limit rules ─────────────────────────────────────────────────────────────

export function useLimitRules() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<LimitRule[]>({
    queryKey: ["poa-limit-rules"],
    queryFn: () => apiFetch<LimitRule[]>(`${B}/limit-rules/`, token),
    enabled: !!session,
  });
}

export function useCreateLimitRule() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<LimitRule, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/limit-rules/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-limit-rules"] });
      // Лимиты материализованы в resolved_grant — бэкенд пересчитывает их сразу.
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useUpdateLimitRule(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<LimitRule, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/limit-rules/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-limit-rules"] });
      // Лимиты материализованы в resolved_grant — бэкенд пересчитывает их сразу.
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

export function useDeleteLimitRule(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/limit-rules/${id}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-limit-rules"] });
      // Лимиты материализованы в resolved_grant — бэкенд пересчитывает их сразу.
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
      qc.invalidateQueries({ queryKey: ["poa-resolve"] });
    },
  });
}

// ─── Matrix ──────────────────────────────────────────────────────────────────

export function useMatrix(params: { authority_id?: number; org_scope_id?: number } = {}) {
  const token = useToken();
  const { data: session } = useSession();
  const qs = new URLSearchParams();
  if (params.authority_id) qs.set("authority_id", String(params.authority_id));
  if (params.org_scope_id) qs.set("org_scope_id", String(params.org_scope_id));
  const suffix = qs.toString() ? `?${qs}` : "";
  return useQuery<AuthorityGrant[]>({
    queryKey: ["poa-matrix", params.authority_id ?? null, params.org_scope_id ?? null],
    queryFn: () => apiFetch<AuthorityGrant[]>(`${B}/matrix/${suffix}`, token),
    enabled: !!session,
  });
}

export function useResolvedGrants(
  params: { authority_id?: number; org_scope_id?: number; org_level_id?: number } = {}
) {
  const token = useToken();
  const { data: session } = useSession();
  const qs = new URLSearchParams();
  if (params.authority_id) qs.set("authority_id", String(params.authority_id));
  if (params.org_scope_id) qs.set("org_scope_id", String(params.org_scope_id));
  if (params.org_level_id) qs.set("org_level_id", String(params.org_level_id));
  const suffix = qs.toString() ? `?${qs}` : "";
  return useQuery<ResolvedGrant[]>({
    queryKey: [
      "poa-resolved",
      params.authority_id ?? null,
      params.org_scope_id ?? null,
      params.org_level_id ?? null,
    ],
    queryFn: () => apiFetch<ResolvedGrant[]>(`${B}/matrix/resolved${suffix}`, token),
    enabled: !!session,
  });
}

export function useUpsertCell() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<AuthorityGrant, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/matrix/cell`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-matrix"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
    },
  });
}

export function useDeleteCell() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, { authority_id: number; org_scope_id?: number | null }>({
    mutationFn: ({ authority_id, org_scope_id }) => {
      const qs = new URLSearchParams({ authority_id: String(authority_id) });
      if (org_scope_id != null) qs.set("org_scope_id", String(org_scope_id));
      return apiFetch(`${B}/matrix/cell?${qs}`, token, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poa-matrix"] });
      qc.invalidateQueries({ queryKey: ["poa-resolved"] });
    },
  });
}

export function useRegenerate() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<{ resolved_count: number }, Error, void>({
    mutationFn: () => apiFetch(`${B}/matrix/regenerate`, token, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-resolved"] }),
  });
}

// ─── Employees ───────────────────────────────────────────────────────────────

export function useEmployees(company?: string) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<Employee[]>({
    queryKey: ["poa-employees", company ?? null],
    queryFn: () =>
      apiFetch<Employee[]>(
        company ? `${B}/employees/?company=${encodeURIComponent(company)}` : `${B}/employees/`,
        token
      ),
    enabled: !!session,
  });
}

export function useCreateEmployee() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Employee, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/employees/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-employees"] }),
  });
}

export function useUpdateEmployee(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Employee, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/employees/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-employees"] }),
  });
}

export function useDeleteEmployee(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiFetch(`${B}/employees/${id}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-employees"] }),
  });
}

export function useResolve(employeeId: number | null) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<ResolveResponse>({
    queryKey: ["poa-resolve", employeeId],
    queryFn: () => apiFetch<ResolveResponse>(`${B}/resolve/${employeeId}`, token),
    enabled: !!session && employeeId != null,
  });
}

// ─── Registry ────────────────────────────────────────────────────────────────

export function useRegistry(
  params: {
    status?: CertificateStatus;
    company?: string;
    authority_id?: number;
    q?: string;
  } = {}
) {
  const token = useToken();
  const { data: session } = useSession();
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.company) qs.set("company", params.company);
  if (params.authority_id) qs.set("authority_id", String(params.authority_id));
  if (params.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs}` : "";
  return useQuery<Certificate[]>({
    queryKey: [
      "poa-registry",
      params.status ?? null,
      params.company ?? null,
      params.authority_id ?? null,
      params.q ?? "",
    ],
    queryFn: () => apiFetch<Certificate[]>(`${B}/registry/${suffix}`, token),
    enabled: !!session,
  });
}

export function useCreateCertificate() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Certificate, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/registry/`, token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-registry"] }),
  });
}

export function useUpdateCertificate(id: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Certificate, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/registry/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-registry"] }),
  });
}

export function useRevokeCertificate() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<Certificate, Error, number>({
    mutationFn: (id) => apiFetch(`${B}/registry/${id}/revoke`, token, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-registry"] }),
  });
}

export function useOriginalIssues(certId: number | null) {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<OriginalIssue[]>({
    queryKey: ["poa-original-issues", certId],
    queryFn: () => apiFetch<OriginalIssue[]>(`${B}/registry/${certId}/original-issues`, token),
    enabled: !!session && certId != null,
  });
}

export function useAddOriginalIssue(certId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation<OriginalIssue, Error, Body>({
    mutationFn: (body) =>
      apiFetch(`${B}/registry/${certId}/original-issue`, token, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poa-original-issues", certId] }),
  });
}

// ─── Documents (конструктор) ─────────────────────────────────────────────────

export interface GranteeIn {
  fio: string;
  passport?: string;
}

export interface RenderRequest {
  /** Поверенные (групповая доверенность — несколько человек) */
  grantees: GranteeIn[];
  validity?: string;
  authority_ids: number[];
  template?: string;
  output?: "docx" | "pdf";
}

export function useTemplates() {
  const token = useToken();
  const { data: session } = useSession();
  return useQuery<string[]>({
    queryKey: ["poa-templates"],
    queryFn: () => apiFetch<string[]>(`${B}/documents/templates`, token),
    enabled: !!session,
  });
}

// ─── Navigator (навигатор заявок) ────────────────────────────────────────────

export interface NavigatorQuestion {
  id: string;
  title: string;
  options: string[];
}

export interface NavigatorStep {
  status: "question" | "result";
  answered: number;
  total: number;
  question: NavigatorQuestion | null;
  result: string | null;
  url: string | null;
}

/** Пошаговый навигатор: по частичным ответам возвращает вопрос или маршрут. */
export function useNavigatorStep() {
  const token = useToken();
  return (answers: Record<string, string>): Promise<NavigatorStep> =>
    apiFetch<NavigatorStep>(`${B}/navigator/step`, token, {
      method: "POST",
      body: JSON.stringify(answers),
    });
}

/** Возвращает функцию генерации: рендерит и скачивает файл в браузере. */
export function useRenderDocument() {
  const token = useToken();
  return async (body: RenderRequest) => {
    const { blob, filename } = await apiDownload(`${B}/documents/render`, token, body);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
}
