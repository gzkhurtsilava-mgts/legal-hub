"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { DocumentVersion } from "@/lib/api/knowledge";

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

function StatusBadge({ status }: { status: DocumentVersion["preview_status"] }) {
  const map: Record<string, [string, string]> = {
    pending:    ["Обработка…", "var(--color-text-tertiary)"],
    processing: ["Генерация превью…", "var(--color-accent-warning)"],
    ready:      ["Готово", "var(--color-accent-positive)"],
    failed:     ["Ошибка превью", "var(--color-accent-negative)"],
    na:         ["Слайды", "var(--brand-blue)"],
  };
  const [label, color] = map[status] ?? ["Неизвестно", "var(--color-text-tertiary)"];
  return (
    <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color, fontWeight: 500 }}>
      ● {label}
    </span>
  );
}

function PdfPreview({ path, token }: { path: string; token: string | undefined }) {
  return (
    <iframe
      src={withToken(path, token)}
      style={{ width: "100%", height: "600px", border: "none", borderRadius: "var(--radius-m)" }}
      title="Просмотр документа"
    />
  );
}

function HtmlPreview({ path, token }: { path: string; token: string | undefined }) {
  return (
    <iframe
      src={withToken(path, token)}
      style={{ width: "100%", height: "600px", border: "1px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}
      title="Просмотр документа"
    />
  );
}

function SlidesPreview({ paths, token }: { paths: string[]; token: string | undefined }) {
  const [current, setCurrent] = useState(0);
  if (!paths.length) {
    return (
      <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
        Слайды ещё не загружены. Загрузите ZIP с PNG-экспортом.
      </p>
    );
  }
  return (
    <div>
      <div style={{ position: "relative", textAlign: "center" }}>
        <img
          src={withToken(paths[current], token)}
          alt={`Слайд ${current + 1}`}
          style={{ maxWidth: "100%", borderRadius: "var(--radius-m)", boxShadow: "var(--shadow-low)" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          style={navBtn}
        >←</button>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {current + 1} / {paths.length}
        </span>
        <button
          onClick={() => setCurrent((c) => Math.min(paths.length - 1, c + 1))}
          disabled={current === paths.length - 1}
          style={navBtn}
        >→</button>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px", justifyContent: "center" }}>
        {paths.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: "8px", height: "8px", borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
              background: i === current ? "var(--brand-blue)" : "var(--color-background-secondary)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function DocumentViewer({ versions }: { versions: DocumentVersion[] }) {
  const token = useToken();
  const [activeId, setActiveId] = useState<number | null>(versions[0]?.id ?? null);
  const active = versions.find((v) => v.id === activeId) ?? versions[0];

  if (!versions.length) {
    return (
      <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "24px 0" }}>
        Версии документа ещё не загружены.
      </p>
    );
  }

  const renderPreview = () => {
    if (!active) return null;
    const { preview_status, preview_data, original_file_path, original_mime_type } = active;

    if (preview_status === "pending" || preview_status === "processing") {
      return (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
          <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>
            Превью генерируется, обновите страницу через несколько секунд…
          </p>
        </div>
      );
    }

    const type = (preview_data as Record<string, unknown> | null)?.type as string | undefined;

    if (type === "pdf" || original_mime_type === "application/pdf") {
      return <PdfPreview path={original_file_path} token={token} />;
    }
    if (type === "html") {
      return <HtmlPreview path={(preview_data as Record<string, string>).path} token={token} />;
    }
    if (type === "slides") {
      const paths = ((preview_data as Record<string, unknown>)?.paths as string[]) ?? [];
      return <SlidesPreview paths={paths} token={token} />;
    }

    return (
      <div style={{ padding: "32px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", textAlign: "center" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
          Превью для этого формата недоступно
        </p>
        <a
          href={withToken(original_file_path, token)}
          download={active.original_filename}
          style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)" }}
        >
          ⬇ Скачать файл
        </a>
      </div>
    );
  };

  return (
    <div>
      {/* Version selector */}
      {versions.length > 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveId(v.id)}
              style={{
                padding: "6px 14px", border: "1.5px solid",
                borderColor: activeId === v.id ? "var(--brand-blue)" : "var(--color-background-secondary)",
                borderRadius: "var(--radius-l)", background: activeId === v.id ? "#008ae014" : "transparent",
                fontFamily: "MTS Compact", fontSize: "13px",
                color: activeId === v.id ? "var(--brand-blue)" : "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              {v.version_label}
            </button>
          ))}
        </div>
      )}

      {/* Active version info */}
      {active && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>
            📄 {active.original_filename} · {formatBytes(active.file_size)}
          </span>
          <StatusBadge status={active.preview_status} />
          <a
            href={withToken(active.original_file_path, token)}
            download={active.original_filename}
            style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--brand-blue)", marginLeft: "auto" }}
          >
            ⬇ Скачать
          </a>
        </div>
      )}

      {renderPreview()}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  padding: "6px 16px", border: "1.5px solid var(--color-background-secondary)",
  borderRadius: "var(--radius-l)", background: "transparent",
  fontFamily: "MTS Compact", fontSize: "16px", cursor: "pointer",
};
