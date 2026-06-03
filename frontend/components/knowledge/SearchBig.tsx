"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useTypeahead } from "@/lib/api/knowledge";
import { useDebounce } from "@/lib/hooks/useDebounce";

const TYPE_LABELS: Record<string, string> = {
  article: "Статья", document: "Документ", link: "Ссылка", faq: "FAQ",
};

export function SearchBig({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebounce(q, 280);

  const { data: suggestions, isFetching } = useTypeahead(debouncedQ);
  const hasResults =
    (suggestions?.sections.length ?? 0) > 0 || (suggestions?.items.length ?? 0) > 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {/* Search input */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "var(--color-background-primary)",
        border: "2px solid var(--color-background-secondary)",
        borderRadius: "var(--radius-l)",
        padding: "0 20px",
        boxShadow: "var(--shadow-low)",
        transition: "border-color 0.15s",
      }}
        onFocus={() => null}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-icons-secondary)" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={q}
          placeholder="Поиск по базе знаний..."
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => q.length >= 2 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) navigate(`/knowledge?q=${encodeURIComponent(q.trim())}`);
            if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
          }}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "MTS Compact", fontSize: "17px", color: "var(--color-text-primary)",
            padding: "16px 0",
          }}
        />
        {isFetching && <Spinner size={16} />}
        {q && (
          <button
            onClick={() => { setQ(""); setOpen(false); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--color-icons-secondary)", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && q.length >= 2 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: "var(--color-background-primary)",
          border: "1px solid var(--color-background-secondary)",
          borderRadius: "var(--radius-m)",
          boxShadow: "var(--shadow-high)",
          maxHeight: "420px", overflowY: "auto",
        }}>
          {!isFetching && !hasResults && debouncedQ.length >= 2 && (
            <p style={{ padding: "16px 20px", fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)" }}>
              Ничего не найдено
            </p>
          )}

          {(suggestions?.sections ?? []).map((s) => (
            <button key={`s-${s.id}`} onClick={() => navigate(`/knowledge/sections/${s.slug}`)}
              style={_rowStyle}>
              <span style={_labelStyle}>Раздел</span>
              <p style={_titleStyle}>{s.name}</p>
            </button>
          ))}

          {(suggestions?.items ?? []).map((item) => (
            <button key={`i-${item.id}`} onClick={() => navigate(`/knowledge/items/${item.id}`)}
              style={_rowStyle}>
              <span style={_labelStyle}>{TYPE_LABELS[item.item_type] ?? item.item_type}</span>
              <p style={_titleStyle}>{item.title}</p>
            </button>
          ))}

          {hasResults && (
            <button
              onClick={() => navigate(`/knowledge?q=${encodeURIComponent(q.trim())}`)}
              style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
                borderTop: "1px solid var(--color-background-secondary)",
                fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)",
              }}
            >
              Все результаты по запросу «{q}» →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const _rowStyle: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left",
  padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
  borderBottom: "1px solid var(--color-background-secondary)",
};
const _labelStyle: React.CSSProperties = {
  fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)",
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const _titleStyle: React.CSSProperties = {
  fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", marginTop: "2px",
};
