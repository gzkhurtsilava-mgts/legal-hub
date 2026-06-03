"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSections, useCreateKnowledgeItem } from "@/lib/api/knowledge";
import type { ItemType, Visibility } from "@/lib/api/knowledge";

const TYPE_OPTIONS: { value: ItemType; label: string; desc: string }[] = [
  { value: "article", label: "Статья", desc: "Текстовый материал с редактором" },
  { value: "link", label: "Ссылка", desc: "Ссылка на внешний ресурс" },
  { value: "faq", label: "FAQ", desc: "Вопрос и ответ" },
  { value: "document", label: "Документ", desc: "Файл (доступно в M4)" },
];

const EDITOR_ROLES = ["admin", "lawyer"];

export default function NewItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const { data: sections = [] } = useSections();
  const topSections = sections.filter((s) => s.parent_id === null);
  const createItem = useCreateKnowledgeItem();

  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [itemType, setItemType] = useState<ItemType>("article");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  if (!isEditor) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет доступа</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!sectionId) { setError("Выберите раздел"); return; }
    if (!title.trim()) { setError("Введите название"); return; }

    try {
      const item = await createItem.mutateAsync({
        section_id: Number(sectionId),
        item_type: itemType,
        title: title.trim(),
        summary: summary.trim() || undefined,
        visibility,
        tag_ids: [],
      });
      router.push(`/knowledge/admin/items/${item.id}/edit`);
    } catch {
      setError("Ошибка при создании. Попробуйте ещё раз.");
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/knowledge")} style={linkBtn}>База знаний</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Новый материал</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", marginBottom: "28px" }}>
        Новый материал
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Type selector */}
        <div>
          <label style={labelStyle}>Тип материала</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.value === "document"}
                onClick={() => setItemType(opt.value)}
                style={{
                  padding: "12px 16px", border: "1.5px solid",
                  borderColor: itemType === opt.value ? "var(--brand-blue)" : "var(--color-background-secondary)",
                  borderRadius: "var(--radius-m)", background: itemType === opt.value ? "#008ae014" : "var(--color-background-primary)",
                  cursor: opt.value === "document" ? "not-allowed" : "pointer",
                  opacity: opt.value === "document" ? 0.5 : 1,
                  textAlign: "left",
                }}
              >
                <p style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: itemType === opt.value ? "var(--brand-blue)" : "var(--color-text-primary)", margin: 0 }}>{opt.label}</p>
                <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Section */}
        <div>
          <label style={labelStyle}>Раздел</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : "")}
            style={inputStyle}
          >
            <option value="">Выберите раздел…</option>
            {sections.filter((s) => s.parent_id !== null || !topSections.some((t) => t.id === s.id)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название материала"
            style={inputStyle}
          />
        </div>

        {/* Summary */}
        <div>
          <label style={labelStyle}>Краткое описание <span style={{ color: "var(--color-text-tertiary)" }}>(необязательно)</span></label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Одна-две строки — что содержит этот материал"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Visibility */}
        <div>
          <label style={labelStyle}>Доступ</label>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            {([["public", "Все сотрудники"], ["bpo_only", "Только БПО"]] as const).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setVisibility(val)}
                style={{
                  padding: "8px 16px", border: "1.5px solid",
                  borderColor: visibility === val ? "var(--brand-blue)" : "var(--color-background-secondary)",
                  borderRadius: "var(--radius-l)",
                  background: visibility === val ? "#008ae014" : "transparent",
                  fontFamily: "MTS Compact", fontSize: "14px",
                  color: visibility === val ? "var(--brand-blue)" : "var(--color-text-primary)",
                  cursor: "pointer",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-negative)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button type="button" onClick={() => router.back()} style={secondaryBtn}>Отмена</button>
          <button type="submit" disabled={createItem.isPending} style={primaryBtn}>
            {createItem.isPending ? "Создание…" : "Создать →"}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", display: "block", marginBottom: "6px" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", fontFamily: "MTS Compact", fontSize: "14px", background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" };
const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "16px" };
const primaryBtn: React.CSSProperties = { padding: "10px 28px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "10px 20px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", cursor: "pointer" };
