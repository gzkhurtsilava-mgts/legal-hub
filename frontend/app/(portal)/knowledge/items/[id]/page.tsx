"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useKnowledgeItem, useArticleContent } from "@/lib/api/knowledge";
import { ArticleViewer } from "@/components/knowledge/viewers/ArticleViewer";

const TYPE_LABELS: Record<string, string> = {
  article: "Статья", document: "Документ", link: "Ссылка", faq: "FAQ",
};

const EDITOR_ROLES = ["admin", "lawyer"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const { data: item, isLoading: itemLoading } = useKnowledgeItem(itemId);
  const { data: articleContent, isLoading: articleLoading } = useArticleContent(
    item?.item_type === "article" ? itemId : 0
  );

  const isLoading = itemLoading || (item?.item_type === "article" && articleLoading);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Материал не найден</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button onClick={() => router.push("/knowledge")} style={linkBtn}>База знаний</button>
        <span style={sep}>›</span>
        <button onClick={() => router.back()} style={linkBtn}>Раздел</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {TYPE_LABELS[item.item_type]}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "26px", color: "var(--color-text-primary)", marginBottom: "8px", lineHeight: 1.25 }}>
            {item.title}
          </h1>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {item.published_at && (
              <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                {formatDate(item.published_at)}
              </span>
            )}
            {item.tags.map((tag) => (
              <span key={tag.id} style={{ fontFamily: "MTS Compact", fontSize: "12px", color: tag.color ?? "var(--brand-blue)", background: `${tag.color ?? "var(--brand-blue)"}18`, padding: "2px 8px", borderRadius: "999px" }}>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        {isEditor && (
          <button
            onClick={() => router.push(`/knowledge/admin/items/${itemId}/edit`)}
            style={{ padding: "8px 16px", background: "var(--color-background-secondary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            ✏️ Редактировать
          </button>
        )}
      </div>

      {/* Summary */}
      {item.summary && (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "28px", lineHeight: 1.6, borderLeft: "3px solid var(--brand-blue)", paddingLeft: "16px" }}>
          {item.summary}
        </p>
      )}

      {/* Content by type */}
      {item.item_type === "article" && (
        <ArticleViewer
          content={articleContent?.content ?? null}
          tocEnabled={articleContent?.toc_enabled ?? false}
          attachments={articleContent?.attachments ?? []}
        />
      )}

      {item.item_type === "link" && (
        <div style={{ padding: "20px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Внешняя ссылка</p>
          <a href="#" style={{ fontFamily: "MTS Compact", fontSize: "16px", color: "var(--brand-blue)" }}>
            Открыть ресурс →
          </a>
        </div>
      )}

      {item.item_type === "faq" && (
        <div style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-primary)", lineHeight: 1.65 }}>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "12px" }}>Ответ:</p>
          <p>Содержимое FAQ будет доступно в M5.</p>
        </div>
      )}

      {item.item_type === "document" && (
        <div style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)" }}>
          Просмотр документов будет доступен в M4.
        </div>
      )}
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)",
  background: "none", border: "none", cursor: "pointer", padding: 0,
};
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "16px" };
