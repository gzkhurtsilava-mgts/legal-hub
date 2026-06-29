"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSections, useCreateKnowledgeItem, useTags } from "@/lib/api/knowledge";
import type { ItemType, Visibility, Tag } from "@/lib/api/knowledge";
import { TagPicker } from "@/components/knowledge/TagPicker";
import { Icon } from "@/components/icons";
import { Button, LinkButton, Select } from "@/components/ui";

const TYPE_OPTIONS: { value: ItemType; label: string; desc: string }[] = [
  { value: "article", label: "Статья", desc: "Текстовый материал с редактором" },
  { value: "link", label: "Ссылка", desc: "Ссылка на внешний ресурс" },
  { value: "document", label: "Документ", desc: "Файл с версионированием" },
];

const EDITOR_ROLES = ["admin", "lawyer"];

export default function NewItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const { data: sections = [] } = useSections();
  const { data: allTags = [] } = useTags();
  const createItem = useCreateKnowledgeItem();

  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [itemType, setItemType] = useState<ItemType>("article");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");

  if (!isEditor) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет доступа</p>
      </div>
    );
  }

  const handleTypeChange = (newType: ItemType) => {
    if (newType === itemType) return;
    if (itemType === "link" && url.trim()) {
      if (!confirm("Заполненный URL будет сброшен при смене типа. Продолжить?")) return;
      setUrl("");
    }
    setItemType(newType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!sectionId) { setError("Выберите раздел"); return; }
    if (!title.trim()) { setError("Введите название"); return; }
    if (itemType === "link" && url.trim() && !isValidUrl(url.trim())) {
      setError("Введите корректный URL (https://…)"); return;
    }

    try {
      const item = await createItem.mutateAsync({
        section_id: Number(sectionId),
        item_type: itemType,
        title: title.trim(),
        summary: summary.trim() || undefined,
        visibility,
        tag_ids: selectedTags.map((t) => t.id),
      });
      router.push(`/knowledge/admin/items/${item.id}/edit`);
    } catch {
      setError("Ошибка при создании. Попробуйте ещё раз.");
    }
  };

  const titleLabel = "Название";
  const titlePlaceholder = itemType === "link" ? "Краткое название ресурса" : "Введите название материала";

  return (
    <div style={{ padding: "32px 24px", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <LinkButton onClick={() => router.push("/knowledge")}>База знаний</LinkButton>
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
                onClick={() => handleTypeChange(opt.value)}
                style={{
                  padding: "12px 16px", border: "1.5px solid",
                  borderColor: itemType === opt.value ? "var(--brand-blue)" : "var(--color-background-secondary)",
                  borderRadius: "var(--radius-m)",
                  background: itemType === opt.value ? "var(--brand-blue-tint)" : "var(--color-background-primary)",
                  cursor: "pointer", textAlign: "left",
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
          <Select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Выберите раздел…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>{titleLabel}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholder}
            style={inputStyle}
          />
        </div>

        {/* URL — only for link type */}
        {itemType === "link" && (
          <div>
            <label style={labelStyle}>URL <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(можно добавить позже)</span></label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              style={inputStyle}
            />
          </div>
        )}

        {/* Summary */}
        <div>
          <label style={labelStyle}>Краткое описание <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(необязательно)</span></label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Одна-две строки — что содержит этот материал"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>

        {/* Tags */}
        <div>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Темы</label>
          <TagPicker
            selectedTags={selectedTags}
            availableTags={allTags}
            onAdd={(tagId) => {
              const tag = allTags.find((t) => t.id === tagId);
              if (tag) setSelectedTags((prev) => [...prev, tag]);
            }}
            onRemove={(tagId) => setSelectedTags((prev) => prev.filter((t) => t.id !== tagId))}
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
                  background: visibility === val ? "var(--brand-blue-tint)" : "transparent",
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
          <Button type="button" variant="secondary" onClick={() => router.back()}>Отмена</Button>
          <Button
            type="submit"
            disabled={createItem.isPending}
            iconRight={createItem.isPending ? undefined : <Icon name="ArrowRightSize24StyleOutline" size={16} />}
          >
            {createItem.isPending ? "Создание…" : "Создать"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function isValidUrl(s: string) {
  try { new URL(s); return true; } catch { return false; }
}

const labelStyle: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", display: "block", marginBottom: "6px" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", fontFamily: "MTS Compact", fontSize: "14px", background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)", fontSize: "16px" };
