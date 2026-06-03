"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiFetch } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Visibility = "public" | "bpo_only";
export type ItemType = "article" | "document" | "link" | "faq";
export type ItemStatus = "draft" | "published" | "archived";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  item_count: number;
}

export interface Section {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
  item_count: number;
}

export interface SectionDetail extends Section {
  children: Section[];
}

export interface KnowledgeItem {
  id: number;
  section_id: number;
  item_type: ItemType;
  title: string;
  summary: string | null;
  visibility: Visibility;
  status: ItemStatus;
  author_id: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  is_favorite: boolean;
}

export interface KnowledgeItemListResponse {
  items: KnowledgeItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface ItemFilters {
  section_id?: number;
  item_type?: ItemType;
  tag_ids?: number[];
  status?: ItemStatus;
  favorites_only?: boolean;
  q?: string;
  skip?: number;
  limit?: number;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export interface TypeaheadSection {
  id: number;
  name: string;
  slug: string;
  visibility: Visibility;
}

export interface TypeaheadItem {
  id: number;
  title: string;
  item_type: ItemType;
  section_id: number;
}

export interface TypeaheadResponse {
  sections: TypeaheadSection[];
  items: TypeaheadItem[];
}

export const knowledgeKeys = {
  all: ["knowledge"] as const,
  sections: () => [...knowledgeKeys.all, "sections"] as const,
  section: (id: number) => [...knowledgeKeys.all, "sections", id] as const,
  items: (filters?: ItemFilters) => [...knowledgeKeys.all, "items", filters ?? {}] as const,
  item: (id: number) => [...knowledgeKeys.all, "items", id] as const,
  tags: () => [...knowledgeKeys.all, "tags"] as const,
  favorites: (filters?: Pick<ItemFilters, "skip" | "limit">) =>
    [...knowledgeKeys.all, "favorites", filters ?? {}] as const,
  typeahead: (q: string) => [...knowledgeKeys.all, "typeahead", q] as const,
  search: (q: string, filters?: ItemFilters) =>
    [...knowledgeKeys.all, "search", q, filters ?? {}] as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildItemsUrl(filters: ItemFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.section_id != null) params.set("section_id", String(filters.section_id));
  if (filters.item_type) params.set("item_type", filters.item_type);
  if (filters.tag_ids?.length) filters.tag_ids.forEach((t) => params.append("tag_ids", String(t)));
  if (filters.status) params.set("status", filters.status);
  if (filters.favorites_only) params.set("favorites_only", "true");
  if (filters.q) params.set("q", filters.q);
  if (filters.skip != null) params.set("skip", String(filters.skip));
  if (filters.limit != null) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return `/api/knowledge/items${qs ? `?${qs}` : ""}`;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useToken() {
  const { data: session } = useSession();
  return session?.accessToken as string | undefined;
}

export function useSections() {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.sections(),
    queryFn: () => apiFetch<Section[]>("/api/knowledge/sections", token),
    enabled: !!token,
  });
}

export function useSection(id: number) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.section(id),
    queryFn: () => apiFetch<SectionDetail>(`/api/knowledge/sections/${id}`, token),
    enabled: !!token && !!id,
  });
}

export function useKnowledgeItems(filters?: ItemFilters, opts?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.items(filters),
    queryFn: () => apiFetch<KnowledgeItemListResponse>(buildItemsUrl(filters), token),
    enabled: (opts?.enabled !== false) && !!token,
  });
}

export function useKnowledgeItem(id: number) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.item(id),
    queryFn: () => apiFetch<KnowledgeItem>(`/api/knowledge/items/${id}`, token),
    enabled: !!token && !!id,
  });
}

export function useTags() {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.tags(),
    queryFn: () => apiFetch<Tag[]>("/api/knowledge/tags", token),
    enabled: !!token,
  });
}

export function useFavorites(filters?: Pick<ItemFilters, "skip" | "limit">) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.favorites(filters),
    queryFn: () => apiFetch<KnowledgeItemListResponse>("/api/knowledge/favorites", token),
    enabled: !!token,
  });
}

export function useTypeahead(q: string) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.typeahead(q),
    queryFn: () =>
      apiFetch<TypeaheadResponse>(
        `/api/knowledge/search/typeahead?q=${encodeURIComponent(q)}`,
        token
      ),
    enabled: !!token && q.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useSearch(q: string, filters?: Omit<ItemFilters, "q">) {
  const token = useToken();
  const params = new URLSearchParams({ q });
  if (filters?.section_id != null) params.set("section_id", String(filters.section_id));
  if (filters?.item_type) params.set("item_type", filters.item_type);
  if (filters?.tag_ids?.length) filters.tag_ids.forEach((t) => params.append("tag_ids", String(t)));
  if (filters?.skip != null) params.set("skip", String(filters.skip));
  if (filters?.limit != null) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: knowledgeKeys.search(q, filters),
    queryFn: () =>
      apiFetch<KnowledgeItemListResponse>(`/api/knowledge/search?${params}`, token),
    enabled: !!token && q.length >= 2,
  });
}

export function useToggleFavorite(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: () => apiFetch<void>(`/api/knowledge/items/${itemId}/favorite`, token, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeKeys.item(itemId) });
      qc.invalidateQueries({ queryKey: knowledgeKeys.favorites() });
    },
  });

  const remove = useMutation({
    mutationFn: () => apiFetch<void>(`/api/knowledge/items/${itemId}/favorite`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeKeys.item(itemId) });
      qc.invalidateQueries({ queryKey: knowledgeKeys.favorites() });
    },
  });

  return { add, remove };
}
