"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiFetch, apiFetchForm } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Visibility = "public" | "bpo_only";
export type ItemType = "article" | "document" | "link";
export type ItemStatus = "draft" | "published" | "archived";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  entity_type: string | null;
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

export interface KnowledgeItemCreate {
  section_id: number;
  item_type: ItemType;
  title: string;
  summary?: string;
  visibility: Visibility;
  tag_ids: number[];
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

export interface AttachmentMeta {
  filename: string;
  path: string;
  size: number;
  mime_type: string;
}

export interface ArticleContentData {
  content: Record<string, unknown> | null;
  attachments: AttachmentMeta[];
  toc_enabled: boolean;
}

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
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
  sectionBySlug: (slug: string) => [...knowledgeKeys.all, "sections", "slug", slug] as const,
  items: (filters?: ItemFilters) => [...knowledgeKeys.all, "items", filters ?? {}] as const,
  item: (id: number) => [...knowledgeKeys.all, "items", id] as const,
  tags: (itemType?: ItemType) => [...knowledgeKeys.all, "tags", itemType ?? "all"] as const,
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

export function useTags(itemType?: ItemType) {
  const token = useToken();
  const url = itemType
    ? `/api/knowledge/tags?item_type=${itemType}`
    : "/api/knowledge/tags";
  return useQuery({
    queryKey: knowledgeKeys.tags(itemType),
    queryFn: () => apiFetch<Tag[]>(url, token),
    enabled: !!token,
  });
}

export interface SectionCreate {
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index?: number;
  visibility: Visibility;
}

export interface SectionUpdate {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  order_index?: number;
  visibility?: Visibility;
}

export function useCreateSection() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SectionCreate) =>
      apiFetch<Section>("/api/knowledge/sections", token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.sections() }),
  });
}

export function useUpdateSection(sectionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SectionUpdate) =>
      apiFetch<Section>(`/api/knowledge/sections/${sectionId}`, token, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.sections() }),
  });
}

export function useDeleteSection(sectionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>(`/api/knowledge/sections/${sectionId}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.sections() }),
  });
}

export function useSectionBySlug(slug: string) {
  const token = useToken();
  return useQuery({
    queryKey: knowledgeKeys.sectionBySlug(slug),
    queryFn: () => apiFetch<SectionDetail>(`/api/knowledge/sections/by-slug/${slug}`, token),
    enabled: !!token && !!slug,
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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: knowledgeKeys.item(itemId) });
    // invalidate all items list queries (any filter combination)
    qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    qc.invalidateQueries({ queryKey: ["knowledge", "favorites"] });
    qc.invalidateQueries({ queryKey: ["knowledge", "search"] });
  };

  const add = useMutation({
    mutationFn: () => apiFetch<void>(`/api/knowledge/items/${itemId}/favorite`, token, { method: "POST" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => apiFetch<void>(`/api/knowledge/items/${itemId}/favorite`, token, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  return { add, remove };
}

// ─── Authenticated file URLs (для <iframe>, <img>, <a download>) ──────────────

export function useFileUrl(path: string | null | undefined): string | null {
  const { data: session } = useSession();
  const token = (session as Record<string, unknown> | null)?.accessToken as string | undefined;
  if (!path || !token) return null;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `/api/files/${cleanPath}?token=${encodeURIComponent(token)}`;
}

// ─── Article content ──────────────────────────────────────────────────────────

export function useArticleContent(itemId: number) {
  const token = useToken();
  return useQuery({
    queryKey: ["knowledge", "article", itemId],
    queryFn: () => apiFetch<ArticleContentData>(`/api/knowledge/items/${itemId}/article`, token),
    enabled: !!token && !!itemId,
  });
}

export function useUpdateArticle(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: Record<string, unknown> | null; toc_enabled: boolean }) =>
      apiFetch<ArticleContentData>(`/api/knowledge/items/${itemId}/article`, token, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "article", itemId] });
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    },
  });
}

export function useUploadMedia() {
  const token = useToken();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<UploadedFile>("/api/knowledge/uploads/media", token, form);
    },
  });
}

export function useUploadAttachment(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<UploadedFile>(
        `/api/knowledge/uploads/attachment?item_id=${itemId}`, token, form
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "article", itemId] });
    },
  });
}

export function useUpdateKnowledgeItem(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; summary?: string; visibility?: Visibility; tag_ids?: number[] }) =>
      apiFetch<KnowledgeItem>(`/api/knowledge/items/${itemId}`, token, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeKeys.item(itemId) });
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    },
  });
}

export function useDeleteKnowledgeItem(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>(`/api/knowledge/items/${itemId}`, token, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    },
  });
}

export function useCreateKnowledgeItem() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: KnowledgeItemCreate) =>
      apiFetch<KnowledgeItem>("/api/knowledge/items", token, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    },
  });
}

export function usePublishItem(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<KnowledgeItem>(`/api/knowledge/items/${itemId}/publish`, token, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
      qc.invalidateQueries({ queryKey: ["knowledge", "items", itemId] });
    },
  });
}

// ─── Document versions ────────────────────────────────────────────────────────

export interface DocumentVersion {
  id: number;
  document_id: number;
  version_label: string;
  effective_date: string | null;
  original_filename: string;
  original_file_path: string;
  original_mime_type: string;
  file_size: number;
  preview_status: "pending" | "processing" | "ready" | "failed" | "na";
  preview_data: Record<string, unknown> | null;
  notes: string | null;
  is_current: boolean;
  source_filename: string | null;
  source_file_path: string | null;
  source_file_size: number | null;
  source_mime_type: string | null;
  uploaded_at: string;
}

export function useDocumentVersions(itemId: number) {
  const token = useToken();
  return useQuery({
    queryKey: ["knowledge", "versions", itemId],
    queryFn: () => apiFetch<DocumentVersion[]>(`/api/knowledge/items/${itemId}/versions`, token),
    enabled: !!token && !!itemId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.some((v) => v.preview_status === "pending" || v.preview_status === "processing"))
        return 3000;
      return false;
    },
  });
}

export function useUploadVersion(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pdfFile, sourceFile, versionLabel, notes }: { pdfFile: File; sourceFile?: File | null; versionLabel: string; notes?: string }) => {
      const form = new FormData();
      form.append("pdf_file", pdfFile);
      if (sourceFile) form.append("source_file", sourceFile);
      form.append("version_label", versionLabel);
      if (notes) form.append("notes", notes);
      return apiFetchForm<DocumentVersion>(`/api/knowledge/items/${itemId}/versions`, token, form);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useReplaceVersionSource(itemId: number, versionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<DocumentVersion>(
        `/api/knowledge/items/${itemId}/versions/${versionId}/source`, token, form, "PUT"
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useDeleteVersion(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: number) =>
      apiFetch<void>(`/api/knowledge/items/${itemId}/versions/${versionId}`, token, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useUploadSlidesZip(itemId: number, versionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<DocumentVersion>(
        `/api/knowledge/items/${itemId}/versions/${versionId}/slides`, token, form
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useUpdateVersionMeta(itemId: number, versionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { version_label?: string; notes?: string; effective_date?: string | null }) =>
      apiFetch<DocumentVersion>(`/api/knowledge/items/${itemId}/versions/${versionId}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useSetCurrentVersion(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: number) =>
      apiFetch<DocumentVersion>(`/api/knowledge/items/${itemId}/versions/${versionId}/set-current`, token, {
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useReplaceVersionFile(itemId: number, versionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<DocumentVersion>(
        `/api/knowledge/items/${itemId}/versions/${versionId}/file`, token, form, "PUT"
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

export function useReplaceVersionPdf(itemId: number, versionId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiFetchForm<DocumentVersion>(
        `/api/knowledge/items/${itemId}/versions/${versionId}/pdf`, token, form, "PUT"
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "versions", itemId] }),
  });
}

// ─── Link content ─────────────────────────────────────────────────────────────

export interface LinkContentData {
  url: string;
}

export function useLinkContent(itemId: number) {
  const token = useToken();
  return useQuery({
    queryKey: ["knowledge", "link", itemId],
    queryFn: () => apiFetch<LinkContentData>(`/api/knowledge/items/${itemId}/link`, token),
    enabled: !!token && !!itemId,
  });
}

export function useUpdateLink(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { url: string }) =>
      apiFetch<LinkContentData>(`/api/knowledge/items/${itemId}/link`, token, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "link", itemId] });
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
    },
  });
}

export function useDeleteAttachment(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (path: string) =>
      apiFetch<void>(
        `/api/knowledge/items/${itemId}/attachments?path=${encodeURIComponent(path)}`,
        token,
        { method: "DELETE" },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge", "article", itemId] }),
  });
}

export function useArchiveItem(itemId: number) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<KnowledgeItem>(`/api/knowledge/items/${itemId}/archive`, token, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", "items"] });
      qc.invalidateQueries({ queryKey: ["knowledge", "items", itemId] });
    },
  });
}
