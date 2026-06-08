"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useKnowledgeItem, useSection, useTags,
  useArticleContent, useUpdateArticle,
  useUpdateKnowledgeItem, useDeleteKnowledgeItem,
  usePublishItem, useArchiveItem,
  useUploadAttachment, useDeleteAttachment,
  useLinkContent, useUpdateLink,
} from "@/lib/api/knowledge";
import type { Tag } from "@/lib/api/knowledge";
import { ArticleEditor } from "@/components/knowledge/editors/ArticleEditor";
import { VersionUpload } from "@/components/knowledge/editors/VersionUpload";
import { LinkEditor } from "@/components/knowledge/editors/LinkEditor";
import { TagPicker } from "@/components/knowledge/TagPicker";
import { ConfirmModal } from "@/components/knowledge/editors/ConfirmModal";
import { useDocumentVersions } from "@/lib/api/knowledge";

const EDITOR_ROLES = ["admin", "lawyer"];

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик", published: "Опубликовано", archived: "В архиве",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "var(--color-text-tertiary)",
  published: "var(--color-accent-positive)",
  archived: "var(--color-accent-warning)",
};

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const { data: item, isLoading: itemLoading } = useKnowledgeItem(itemId);
  const { data: section } = useSection(item?.section_id ?? 0);
  const { data: allTags = [] } = useTags();
  const { data: docVersions = [] } = useDocumentVersions(
    item?.item_type === "document" ? itemId : 0
  );
  const [deleteDocConfirm, setDeleteDocConfirm] = useState(false);
  const token = (session as Record<string, unknown> | null)?.accessToken as string | undefined;
  const { data: articleData, isLoading: articleLoading } = useArticleContent(
    item?.item_type === "article" ? itemId : 0
  );
  const { data: linkData } = useLinkContent(item?.item_type === "link" ? itemId : 0);

  const updateItem = useUpdateKnowledgeItem(itemId);
  const deleteItem = useDeleteKnowledgeItem(itemId);
  const updateArticle = useUpdateArticle(itemId);
  const updateLink = useUpdateLink(itemId);
  const publishItem = usePublishItem(itemId);
  const archiveItem = useArchiveItem(itemId);
  const uploadAttachment = useUploadAttachment(itemId);
  const deleteAttachment = useDeleteAttachment(itemId);

  // Metadata local state (initialized once from server)
  const metaInitialized = useRef(false);
  const tocInitialized = useRef(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [contentSaveSuccess, setContentSaveSuccess] = useState(false);
  const [tocEnabled, setTocEnabled] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [liveArticleContent, setLiveArticleContent] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (item && !metaInitialized.current) {
      setEditTitle(item.title);
      setEditSummary(item.summary ?? "");
      metaInitialized.current = true;
    }
  }, [item]);

  useEffect(() => {
    if (articleData && !tocInitialized.current) {
      setTocEnabled(articleData.toc_enabled);
      tocInitialized.current = true;
    }
  }, [articleData]);

  if (!isEditor) {
    return <div style={{ padding: "40px 24px" }}><p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет доступа</p></div>;
  }

  if (itemLoading || (item?.item_type === "article" && articleLoading)) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}><Spinner size={24} /></div>;
  }

  if (!item) {
    return <div style={{ padding: "40px 24px" }}><p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Материал не найден</p></div>;
  }

  const sectionHref = section ? `/knowledge/sections/${section.slug}` : "/knowledge";

  const flashContent = () => {
    setContentSaveSuccess(true);
    setTimeout(() => setContentSaveSuccess(false), 3000);
  };

  const handleSaveMeta = async () => {
    await updateItem.mutateAsync({ title: editTitle.trim(), summary: editSummary.trim() || undefined });
  };

  const handleTagAdd = (tagId: number) => {
    const newIds = [...item.tags.map((t: Tag) => t.id), tagId];
    updateItem.mutate({ tag_ids: newIds });
  };

  const handleTagRemove = (tagId: number) => {
    const newIds = item.tags.filter((t: Tag) => t.id !== tagId).map((t: Tag) => t.id);
    updateItem.mutate({ tag_ids: newIds });
  };

  const handleDelete = async () => {
    await deleteItem.mutateAsync();
    router.push("/knowledge/admin");
  };

  const handleSaveArticle = async (content: Record<string, unknown>, toc: boolean) => {
    await updateArticle.mutateAsync({ content, toc_enabled: toc });
    flashContent();
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAttachment.mutateAsync(file);
    e.target.value = "";
  };

  const handleSaveLink = async (url: string) => {
    await updateLink.mutateAsync({ url });
    flashContent();
  };

  const deleteDocMessage = item.item_type === "document" && docVersions.length >= 2
    ? `Вы уверены, что хотите удалить документ «${item.title}»? Это приведёт к удалению документа и всех его версий (${docVersions.length} шт.).`
    : `Удалить «${item.title}»? Действие необратимо.`;

  return (
    <>
    {deleteDocConfirm && (
      <ConfirmModal
        title={`Удалить «${item.title}»?`}
        message={deleteDocMessage}
        onConfirm={() => { setDeleteDocConfirm(false); handleDelete(); }}
        onCancel={() => setDeleteDocConfirm(false)}
      />
    )}
    <div style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/knowledge")} style={linkBtn}>База знаний</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push(sectionHref)} style={linkBtn}>
          {section?.name ?? "Раздел"}
        </button>
        <span style={sep}>›</span>
        <button onClick={() => router.push(`/knowledge/items/${itemId}`)} style={linkBtn}>{item.title}</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Редактирование</span>
      </div>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", color: "var(--color-text-primary)", flex: 1, margin: 0 }}>
          {item.title}
        </h1>
        <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: STATUS_COLORS[item.status], fontWeight: 500 }}>
          ● {STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* Actions bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => router.push(`/knowledge/items/${itemId}`)} style={secondaryBtn}>
          👁 Просмотр
        </button>
        {item.status !== "published" && (
          <button onClick={() => publishItem.mutate()} disabled={publishItem.isPending} style={primaryBtn}>
            {publishItem.isPending ? "…" : "✓ Опубликовать"}
          </button>
        )}
        {item.status === "published" && (
          <button onClick={() => archiveItem.mutate()} disabled={archiveItem.isPending} style={warningBtn}>
            {archiveItem.isPending ? "…" : "Архивировать"}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => setDeleteDocConfirm(true)} disabled={deleteItem.isPending} style={dangerBtn}>
          {deleteItem.isPending ? "…" : "Удалить"}
        </button>
      </div>

      {/* ── Metadata section ─────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)" }}>
        {/* Header — всегда виден, кликабелен */}
        <button
          type="button"
          onClick={() => setPropertiesOpen((v) => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
            borderRadius: propertiesOpen ? "var(--radius-m) var(--radius-m) 0 0" : "var(--radius-m)",
          }}
        >
          <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "12px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Свойства
          </span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
            {propertiesOpen ? "▲ Свернуть" : "▼ Развернуть"}
          </span>
        </button>

        {propertiesOpen && (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--color-background-lower)" }}>
            <div style={{ paddingTop: "16px" }}>
              <label style={metaLabel}>Название</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={metaInput}
              />
            </div>

            <div>
              <label style={metaLabel}>Краткое описание <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(необязательно)</span></label>
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={2}
                style={{ ...metaInput, resize: "vertical" as const }}
              />
            </div>

            <div>
              <label style={{ ...metaLabel, marginBottom: "8px" }}>Темы</label>
              <TagPicker
                selectedTags={item.tags}
                availableTags={allTags}
                onAdd={handleTagAdd}
                onRemove={handleTagRemove}
                disabled={updateItem.isPending}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Type-specific editor ──────────────────────────────────────── */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
        <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Содержимое
        </p>
        {contentSaveSuccess && (
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-positive)" }}>✓ Сохранено</span>
        )}
      </div>

      {item.item_type === "article" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={tocEnabled}
                onChange={(e) => setTocEnabled(e.target.checked)}
              />
              <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Показывать оглавление
              </span>
            </label>
          </div>
          <ArticleEditor
            initialContent={articleData?.content ?? null}
            tocEnabled={tocEnabled}
            attachments={articleData?.attachments ?? []}
            onSave={handleSaveArticle}
            onChange={(content) => setLiveArticleContent(content)}
            isSaving={updateArticle.isPending}
          />
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)", marginBottom: "10px" }}>
              Прикреплённые файлы
            </p>
            {(articleData?.attachments ?? []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {articleData!.attachments.map((att) => (
                  <div key={att.path} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📎 {att.filename}</span>
                    <button
                      type="button"
                      onClick={() => deleteAttachment.mutate(att.path)}
                      disabled={deleteAttachment.isPending}
                      title="Удалить вложение"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", fontSize: "14px", color: "var(--color-text-tertiary)", flexShrink: 0, lineHeight: 1 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent-negative)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-l)", cursor: "pointer", fontFamily: "MTS Compact", fontSize: "13px" }}>
              + Прикрепить файл
              <input type="file" style={{ display: "none" }} onChange={handleAttachmentUpload} disabled={uploadAttachment.isPending} />
            </label>
            {uploadAttachment.isPending && <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: "8px" }}>Загрузка…</span>}
          </div>
        </>
      )}

      {item.item_type === "document" && <VersionUpload itemId={itemId} token={token} />}

      {item.item_type === "link" && (
        <LinkEditor
          initialUrl={linkData?.url ?? ""}
          onSave={handleSaveLink}
          isSaving={updateLink.isPending}
        />
      )}

      {/* ── Bottom actions ── */}
      <div style={{ display: "flex", gap: "10px", marginTop: "36px", paddingTop: "20px", borderTop: "1px solid var(--color-background-secondary)" }}>
        <button
          onClick={async () => {
            if (editTitle.trim() && (editTitle !== item.title || editSummary !== (item.summary ?? ""))) {
              await updateItem.mutateAsync({ title: editTitle.trim(), summary: editSummary.trim() || undefined });
            }
            if (item.item_type === "article") {
              await updateArticle.mutateAsync({
                content: liveArticleContent ?? articleData?.content ?? null,
                toc_enabled: tocEnabled,
              });
            }
            router.push(`/knowledge/items/${itemId}`);
          }}
          disabled={updateItem.isPending || updateArticle.isPending || !editTitle.trim()}
          style={primaryBtn}
        >
          {(updateItem.isPending || updateArticle.isPending) ? "…" : "Сохранить и выйти"}
        </button>
        <button
          onClick={() => router.push(`/knowledge/items/${itemId}`)}
          style={secondaryBtn}
        >
          Отмена
        </button>
      </div>
    </div>
    </>
  );
}

const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "16px" };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "8px 16px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
const warningBtn: React.CSSProperties = { padding: "8px 16px", background: "transparent", color: "var(--color-accent-warning)", border: "1.5px solid var(--color-accent-warning)", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
const dangerBtn: React.CSSProperties = { padding: "8px 16px", background: "transparent", color: "var(--color-accent-negative)", border: "1.5px solid var(--color-accent-negative)", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
const metaLabel: React.CSSProperties = { display: "block", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "5px" };
const metaInput: React.CSSProperties = { width: "100%", padding: "8px 12px", fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1.5px solid transparent", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
