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
