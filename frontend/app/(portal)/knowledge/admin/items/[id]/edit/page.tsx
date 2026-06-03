"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useKnowledgeItem, useArticleContent, useUpdateArticle,
  usePublishItem, useArchiveItem, useUploadAttachment, useToggleAttachmentPreview,
} from "@/lib/api/knowledge";
import { ArticleEditor } from "@/components/knowledge/editors/ArticleEditor";
import { VersionUpload } from "@/components/knowledge/editors/VersionUpload";

const EDITOR_ROLES = ["admin", "lawyer"];

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик", published: "Опубликовано", archived: "В архиве",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "var(--color-text-tertiary)", published: "var(--color-accent-positive)", archived: "var(--color-accent-warning)",
};

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const { data: item, isLoading: itemLoading } = useKnowledgeItem(itemId);
  const { data: articleData, isLoading: articleLoading } = useArticleContent(
    item?.item_type === "article" ? itemId : 0
  );

  const updateArticle = useUpdateArticle(itemId);
  const publishItem = usePublishItem(itemId);
  const archiveItem = useArchiveItem(itemId);
  const uploadAttachment = useUploadAttachment(itemId);
  const togglePreview = useToggleAttachmentPreview(itemId);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tocEnabled, setTocEnabled] = useState(false);

  useEffect(() => {
    if (articleData) setTocEnabled(articleData.toc_enabled);
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

  const handleSave = async (content: Record<string, unknown>, toc: boolean) => {
    await updateArticle.mutateAsync({ content, toc_enabled: toc });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAttachment.mutateAsync(file);
    e.target.value = "";
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/knowledge")} style={linkBtn}>База знаний</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push(`/knowledge/items/${itemId}`)} style={linkBtn}>{item.title}</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Редактирование</span>
      </div>

      {/* Item header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", color: "var(--color-text-primary)", flex: 1, margin: 0 }}>
          {item.title}
        </h1>
        <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: STATUS_COLORS[item.status], fontWeight: 500 }}>
          ● {STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* Actions bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => router.push(`/knowledge/items/${itemId}`)}
          style={{ ...secondaryBtn }}
        >
          👁 Просмотр
        </button>

        {item.status !== "published" && (
          <button
            onClick={() => publishItem.mutate()}
            disabled={publishItem.isPending}
            style={{ ...primaryBtn }}
          >
            {publishItem.isPending ? "…" : "✓ Опубликовать"}
          </button>
        )}

        {item.status === "published" && (
          <button
            onClick={() => archiveItem.mutate()}
            disabled={archiveItem.isPending}
            style={{ ...warningBtn }}
          >
            {archiveItem.isPending ? "…" : "Архивировать"}
          </button>
        )}

        {saveSuccess && (
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-positive)", alignSelf: "center" }}>
            ✓ Сохранено
          </span>
        )}
      </div>

      {/* Article editor */}
      {item.item_type === "article" && (
        <>
          {/* ToC toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={tocEnabled}
                onChange={(e) => setTocEnabled(e.target.checked)}
              />
              <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Показывать содержание (ToC)
              </span>
            </label>
          </div>

          <ArticleEditor
            initialContent={articleData?.content ?? null}
            tocEnabled={tocEnabled}
            onSave={handleSave}
            isSaving={updateArticle.isPending}
          />

          {/* Attachments upload */}
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", marginBottom: "10px" }}>
              Прикреплённые файлы
            </p>
            {(articleData?.attachments ?? []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {articleData!.attachments.map((att) => (
                  <div key={att.path} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1 }}>📎 {att.filename}</span>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={att.is_preview ?? false}
                        onChange={(e) => togglePreview.mutate({ path: att.path, is_preview: e.target.checked })}
                      />
                      <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        Превью
                      </span>
                    </label>
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

      {item.item_type === "document" && (
        <VersionUpload itemId={itemId} />
      )}

      {(item.item_type === "link" || item.item_type === "faq") && (
        <div style={{ padding: "32px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)" }}>
            Редактор для типа «{item.item_type}» будет доступен в M5.
          </p>
        </div>
      )}
    </div>
  );
}

const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "16px" };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "8px 16px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
const warningBtn: React.CSSProperties = { padding: "8px 16px", background: "transparent", color: "var(--color-accent-warning)", border: "1.5px solid var(--color-accent-warning)", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
