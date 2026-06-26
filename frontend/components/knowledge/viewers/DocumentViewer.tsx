"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ButtonIcon } from "@mts-ds/granat2-react-button";
import type { KnowledgeItem, DocumentVersion, Section } from "@/lib/api/knowledge";
import { EditIcon, InfoIcon, DownloadIcon, CrossIcon, Icon } from "@/components/icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useToken() {
  const { data: session } = useSession();
  return (session as Record<string, unknown> | null)?.accessToken as string | undefined;
}

function withToken(path: string, token: string | undefined): string {
  if (!token) return `/api/files/${path}`;
  return `/api/files/${path}?token=${encodeURIComponent(token)}`;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} Б`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1048576).toFixed(1)} МБ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Preview renderer ─────────────────────────────────────────────────────────

function PreviewContent({ active, token }: { active: DocumentVersion; token: string | undefined }) {
  const [slide, setSlide] = useState(0);
  const { preview_status, preview_data, original_file_path, original_mime_type } = active;

  if (preview_status === "pending" || preview_status === "processing") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--color-background-secondary)" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>
          Превью генерируется, обновите страницу через несколько секунд…
        </p>
      </div>
    );
  }

  const type = (preview_data as Record<string, unknown> | null)?.type as string | undefined;

  if (type === "pdf" || original_mime_type === "application/pdf") {
    const pdfPath = (preview_data as Record<string, string> | null)?.path ?? original_file_path;
    return (
      <iframe
        src={withToken(pdfPath, token)}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Просмотр документа"
      />
    );
  }

  if (type === "html") {
    return (
      <iframe
        src={withToken((preview_data as Record<string, string>).path, token)}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Просмотр документа"
      />
    );
  }

  if (type === "slides") {
    const paths = ((preview_data as Record<string, unknown>)?.paths as string[]) ?? [];
    if (!paths.length) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--color-background-secondary)" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)" }}>
            Слайды ещё не загружены. Загрузите ZIP с PNG-экспортом.
          </p>
        </div>
      );
    }
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", background: "var(--color-background-secondary)", overflow: "auto" }}>
        <img
          src={withToken(paths[slide], token)}
          alt={`Слайд ${slide + 1}`}
          style={{ maxWidth: "100%", borderRadius: "var(--radius-m)", boxShadow: "var(--shadow-low)" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
          <button onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} style={slideBtn} aria-label="Предыдущий слайд"><Icon name="ArrowLeftSize24StyleOutline" size={18} /></button>
          <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>{slide + 1} / {paths.length}</span>
          <button onClick={() => setSlide((s) => Math.min(paths.length - 1, s + 1))} disabled={slide === paths.length - 1} style={slideBtn} aria-label="Следующий слайд"><Icon name="ArrowRightSize24StyleOutline" size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px", justifyContent: "center" }}>
          {paths.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: 8, height: 8, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer", background: i === slide ? "var(--brand-blue)" : "var(--color-background-primary)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", background: "var(--color-background-secondary)" }}>
      <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Превью для этого формата недоступно</p>
    </div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────

interface InfoPanelProps {
  item: KnowledgeItem;
  versions: DocumentVersion[];
  active: DocumentVersion | undefined;
  activeId: number | null;
  onSelectVersion: (id: number) => void;
  onClose: () => void;
  token: string | undefined;
}

function InfoPanel({ item, versions, active, activeId, onSelectVersion, onClose, token }: InfoPanelProps) {
  const pdfPreviewPath = (active?.preview_data as Record<string, string> | null)?.path;
  const isPdf = active?.original_mime_type === "application/pdf"
    || (active?.preview_data as Record<string, unknown> | null)?.type === "pdf";

  const pdfDownloadPath = pdfPreviewPath ?? (isPdf ? active?.original_file_path : undefined);

  const sortedVersions = [...versions].sort((a, b) => {
    const da = a.effective_date ?? a.uploaded_at;
    const db = b.effective_date ?? b.uploaded_at;
    return db.localeCompare(da);
  });

  return (
    <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid var(--color-background-secondary)", flexShrink: 0 }}>
        <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)" }}>О документе</span>
        <ButtonIcon size={32} variant="ghost" contextBackgroundColor="primary" aria-label="Закрыть" onClick={onClose}>
          <CrossIcon size={16} />
        </ButtonIcon>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
        {/* Downloads */}
        <section>
          <p style={sectionTitle}>Скачать</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Primary PDF */}
            {active && pdfDownloadPath && (
              <a href={withToken(pdfDownloadPath, token)} download={active.original_filename} style={downloadLink}>
                <DownloadIcon size={16} />
                <span>Основной документ (PDF)</span>
                <span style={{ marginLeft: "auto", color: "var(--color-text-tertiary)", fontSize: "12px" }}>{formatBytes(active.file_size)}</span>
              </a>
            )}
            {/* Source file — only if present */}
            {active?.source_file_path && (
              <a href={withToken(active.source_file_path, token)} download={active.source_filename ?? undefined} style={downloadLink}>
                <DownloadIcon size={16} />
                <span>Исходный файл</span>
                {active.source_file_size && <span style={{ marginLeft: "auto", color: "var(--color-text-tertiary)", fontSize: "12px" }}>{formatBytes(active.source_file_size)}</span>}
              </a>
            )}
          </div>
        </section>

        {/* Description */}
        {item.summary && (
          <section>
            <p style={sectionTitle}>Описание</p>
            <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {item.summary}
            </p>
          </section>
        )}

        {/* Versions */}
        <section>
          <p style={sectionTitle}>Редакции</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sortedVersions.map((v, idx) => {
              const isActive = v.id === activeId;
              const date = v.effective_date ?? v.uploaded_at;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelectVersion(v.id)}
                  style={{
                    display: "flex", flexDirection: "column", gap: "2px",
                    padding: "10px 12px", borderRadius: "var(--radius-m)", border: "1.5px solid",
                    borderColor: isActive ? "var(--brand-blue)" : "var(--color-background-secondary)",
                    background: isActive ? "var(--brand-blue-tint)" : "transparent",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {v.is_current && (
                      <span style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 500, color: "var(--color-accent-positive)", background: "var(--color-background-positive-soft)", padding: "1px 6px", borderRadius: "999px" }}>актуальная</span>
                    )}
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--brand-blue)" : "var(--color-text-primary)" }}>
                      {v.version_label}
                    </span>
                  </div>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    {formatDateShort(date)}
                    {v.notes && ` · ${v.notes}`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

interface DocumentViewerPageProps {
  item: KnowledgeItem;
  versions: DocumentVersion[];
  section: Section | undefined;
  isEditor: boolean;
  itemId: number;
}

export function DocumentViewerPage({ item, versions, section, isEditor, itemId }: DocumentViewerPageProps) {
  const router = useRouter();
  const token = useToken();

  const defaultId = (versions.find((v) => v.is_current) ?? versions[0])?.id ?? null;
  const [activeId, setActiveId] = useState<number | null>(defaultId);
  const [infoOpen, setInfoOpen] = useState(false);

  const active = versions.find((v) => v.id === activeId) ?? versions[0];
  const sectionHref = section ? `/knowledge/sections/${section.slug}` : "/knowledge";

  const versionDate = active ? (active.effective_date ?? active.uploaded_at) : null;

  if (!versions.length) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)" }}>
          Версии документа ещё не загружены.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100dvh - 124px)", display: "flex", flexDirection: "column", padding: "32px 24px", boxSizing: "border-box" }}>

      {/* ── Top bar ── */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", marginBottom: "20px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <button onClick={() => router.push("/knowledge")} style={crumbBtn}>База знаний</button>
          <span style={crumbSep}>›</span>
          <button onClick={() => router.push(sectionHref)} style={crumbBtn}>{section?.name ?? "Раздел"}</button>
          <span style={crumbSep}>›</span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)" }}>Документ</span>
        </div>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <h1 style={{ flex: 1, fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", color: "var(--color-text-primary)", lineHeight: 1.25, margin: 0 }}>
            {item.title}
          </h1>
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            {isEditor && (
              <ButtonIcon size={32} variant="ghost" contextBackgroundColor="primary" aria-label="Редактировать" onClick={() => router.push(`/knowledge/admin/items/${itemId}/edit`)}>
                <EditIcon size={16} />
              </ButtonIcon>
            )}
            <ButtonIcon size={32} variant={infoOpen ? "primary" : "ghost"} contextBackgroundColor="primary" aria-label="Информация о документе" onClick={() => setInfoOpen((o) => !o)}>
              <InfoIcon size={16} />
            </ButtonIcon>
          </div>
        </div>

        {/* Metadata row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
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
          {active && versionDate && (
            <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--brand-blue)", background: "var(--brand-blue-tint)", padding: "2px 10px", borderRadius: "999px", fontWeight: 500 }}>
              Ред. {active.version_label} · {formatDateShort(versionDate)}
            </span>
          )}
        </div>
      </div>

      {/* ── Info panel — fixed, under header/footer (z-index < 1000) ── */}
      {infoOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "320px", zIndex: 500,
          background: "var(--color-background-primary)",
          borderRight: "1px solid var(--color-background-secondary)",
          boxShadow: "var(--shadow-middle)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}>
          <InfoPanel
            item={item}
            versions={versions}
            active={active}
            activeId={activeId}
            onSelectVersion={setActiveId}
            onClose={() => setInfoOpen(false)}
            token={token}
          />
        </div>
      )}

      {/* ── iframe — flex fill, same width as top bar ── */}
      <div style={{ flex: 1, maxWidth: "1000px", margin: "0 auto", width: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, border: "1px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", overflow: "hidden" }}>
          <PreviewContent active={active!} token={token} />
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const crumbBtn: React.CSSProperties = {
  fontFamily: "MTS Compact", fontSize: "13px", color: "var(--brand-blue)",
  background: "none", border: "none", cursor: "pointer", padding: 0,
};
const crumbSep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "14px" };

const sectionTitle: React.CSSProperties = {
  fontFamily: "MTS Wide", fontWeight: 700, fontSize: "13px",
  color: "var(--color-text-secondary)", textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: "10px", margin: "0 0 10px",
};

const downloadLink: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "8px",
  padding: "10px 12px", borderRadius: "var(--radius-m)",
  background: "var(--color-background-secondary)",
  color: "var(--brand-blue)", fontFamily: "MTS Compact", fontSize: "14px",
  textDecoration: "none", cursor: "pointer",
};

const slideBtn: React.CSSProperties = {
  padding: "6px 16px", border: "1.5px solid var(--color-background-secondary)",
  borderRadius: "var(--radius-l)", background: "transparent",
  fontFamily: "MTS Compact", fontSize: "16px", cursor: "pointer",
};
