"use client";

import { Icon } from "@/components/icons";

interface Props {
  url: string;
}

export function LinkViewer({ url }: Props) {
  if (!url) {
    return (
      <div style={{ padding: "20px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
        <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)" }}>
          URL не указан
        </p>
      </div>
    );
  }

  let displayUrl = url;
  try {
    const parsed = new URL(url);
    displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    // url не валидный — показываем как есть
  }

  return (
    <div style={{ padding: "24px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0 }}>
        Внешний ресурс
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)", wordBreak: "break-all" }}>
          {displayUrl}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 20px",
            background: "var(--brand-blue)",
            color: "#fff",
            borderRadius: "var(--radius-l)",
            fontFamily: "MTS Compact",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Открыть ресурс<Icon name="OpenInNewSize24StyleOutline" size={15} />
        </a>
      </div>
    </div>
  );
}
