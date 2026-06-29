"use client";

import { useState, useEffect, useRef } from "react";
import type { Tag } from "@/lib/api/knowledge";
import { Icon } from "@/components/icons";

interface Props {
  selectedTags: Tag[];
  availableTags: Tag[];
  onAdd: (tagId: number) => void;
  onRemove: (tagId: number) => void;
  disabled?: boolean;
}

export function TagPicker({ selectedTags, availableTags, onAdd, onRemove, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unselected = availableTags.filter(
    (t) =>
      !selectedTags.some((s) => s.id === t.id) &&
      t.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", borderRadius: "999px",
              background: `${tag.color ?? "var(--brand-blue)"}20`,
              color: tag.color ?? "var(--brand-blue)",
              fontFamily: "MTS Compact", fontSize: "12px",
            }}
          >
            {tag.name}
            {!disabled && (
              <button
                onClick={() => onRemove(tag.id)}
                aria-label="Убрать тему"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "inherit", padding: "0 0 0 2px", lineHeight: 1,
                  display: "inline-flex", alignItems: "center",
                }}
              >
                <Icon name="CrossSize16StyleOutline" size={13} />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px 3px 8px", borderRadius: "999px",
              background: "var(--color-brand-subtle)",
              border: "1px dashed var(--brand-blue)",
              fontFamily: "MTS Compact", fontSize: "12px",
              color: "var(--color-text-brand)", cursor: "pointer",
            }}
          >
            <Icon name="PlusSize24StyleOutline" size={13} />Тема
          </button>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-background-lower)",
            borderRadius: "var(--radius-m)",
            boxShadow: "var(--shadow-middle)",
            minWidth: "220px",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Поиск темы…"
              style={{
                width: "100%", padding: "6px 10px",
                fontFamily: "MTS Compact", fontSize: "13px",
                background: "var(--color-background-secondary)",
                border: "none",
                borderRadius: "var(--radius-s)",
                outline: "none", boxSizing: "border-box",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", maxHeight: "180px" }}>
            {unselected.length === 0 ? (
              <p style={{ padding: "8px 12px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0 }}>
                {filter ? "Ничего не найдено" : "Все темы добавлены"}
              </p>
            ) : (
              unselected.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => { onAdd(tag.id); setOpen(false); setFilter(""); }}
                  className="ui-menu-item"
                  style={{ color: tag.color ?? "var(--brand-blue)" }}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
