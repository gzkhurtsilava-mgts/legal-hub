"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useSections, useCreateSection, useUpdateSection, useDeleteSection,
} from "@/lib/api/knowledge";
import type { Section, SectionCreate, SectionUpdate, Visibility } from "@/lib/api/knowledge";

const ICON_OPTIONS = [
  { value: "file-text", label: "📄 Документы" },
  { value: "scale",     label: "⚖️ Право" },
  { value: "book-open", label: "📖 Книга" },
  { value: "lock",      label: "🔒 Закрытый" },
  { value: "",          label: "📋 По умолчанию" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zа-яё0-9-]/gi, "")
    .replace(/-+/g, "-");
}

interface SectionRowProps {
  section: Section;
  allSections: Section[];
  depth?: number;
}

function SectionRow({ section, allSections, depth = 0 }: SectionRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [slug, setSlug] = useState(section.slug);
  const [description, setDescription] = useState(section.description ?? "");
  const [icon, setIcon] = useState(section.icon ?? "");
  const [visibility, setVisibility] = useState<Visibility>(section.visibility);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useUpdateSection(section.id);
  const del = useDeleteSection(section.id);
  const router = useRouter();

  const children = allSections.filter((s) => s.parent_id === section.id);

  const handleSave = async () => {
    const data: SectionUpdate = { name, slug, description: description || undefined, icon: icon || undefined, visibility };
    await update.mutateAsync(data);
    setEditing(false);
  };

  const handleDelete = async () => {
    await del.mutateAsync();
    setConfirmDelete(false);
  };

  return (
    <>
      <div
        style={{
          padding: "14px 16px",
          background: "var(--color-background-primary)",
          borderRadius: "var(--radius-m)",
          border: "1px solid var(--color-background-lower)",
          marginLeft: depth > 0 ? "24px" : "0",
        }}
      >
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={lbl}>Название</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (!slug || slug === slugify(section.name)) setSlug(slugify(e.target.value)); }}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>Описание</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание раздела" style={inp} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={lbl}>Иконка</label>
                <select value={icon} onChange={(e) => setIcon(e.target.value)} style={inp}>
                  {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Видимость</label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} style={inp}>
                  <option value="public">Все сотрудники</option>
                  <option value="bpo_only">Только БПО</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleSave} disabled={update.isPending} style={primaryBtn}>
                {update.isPending ? "…" : "Сохранить"}
              </button>
              <button onClick={() => setEditing(false)} style={secondaryBtn}>Отмена</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>
              {ICON_OPTIONS.find((o) => o.value === section.icon)?.label.split(" ")[0] ?? "📋"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
                  {section.name}
                </span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                  /{section.slug}
                </span>
                {section.visibility === "bpo_only" && (
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-accent-warning)", background: "var(--color-background-warning-soft)", padding: "1px 7px", borderRadius: "999px" }}>
                    БПО
                  </span>
                )}
                <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                  {section.item_count} мат.
                </span>
              </div>
              {section.description && (
                <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {section.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => router.push(`/knowledge/sections/${section.slug}`)}
                style={iconBtn}
                title="Открыть раздел"
              >
                👁
              </button>
              <button onClick={() => setEditing(true)} style={iconBtn} title="Редактировать">✏️</button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} style={{ ...iconBtn, color: "var(--color-accent-negative)" }} title="Удалить">🗑</button>
              ) : (
                <>
                  <button onClick={handleDelete} disabled={del.isPending} style={{ ...iconBtn, color: "var(--color-accent-negative)", fontWeight: 700 }}>
                    {del.isPending ? "…" : "Да"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={iconBtn}>Нет</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {children.map((child) => (
        <SectionRow key={child.id} section={child} allSections={allSections} depth={depth + 1} />
      ))}
    </>
  );
}

interface CreateFormProps {
  allSections: Section[];
  onDone: () => void;
}

function CreateForm({ allSections, onDone }: CreateFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const create = useCreateSection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    const data: SectionCreate = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      icon: icon || undefined,
      parent_id: parentId ? Number(parentId) : null,
      visibility,
      order_index: 0,
    };
    await create.mutateAsync(data);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1.5px solid var(--brand-blue)", display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)", margin: 0 }}>
        Новый раздел
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label style={lbl}>Название</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
            placeholder="Название раздела"
            required
            style={inp}
          />
        </div>
        <div>
          <label style={lbl}>Slug (URL)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-razdela" required style={inp} />
        </div>
      </div>
      <div>
        <label style={lbl}>Описание</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание" style={inp} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <div>
          <label style={lbl}>Родительский раздел</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : "")} style={inp}>
            <option value="">— верхний уровень —</option>
            {allSections.filter((s) => s.parent_id === null).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Иконка</label>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} style={inp}>
            {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Видимость</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} style={inp}>
            <option value="public">Все сотрудники</option>
            <option value="bpo_only">Только БПО</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" disabled={create.isPending} style={primaryBtn}>
          {create.isPending ? "Создание…" : "Создать раздел"}
        </button>
        <button type="button" onClick={onDone} style={secondaryBtn}>Отмена</button>
      </div>
    </form>
  );
}

export default function AdminSectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string })?.role;
  const [showCreate, setShowCreate] = useState(false);

  const { data: sections = [], isLoading } = useSections();
  const topSections = sections.filter((s) => s.parent_id === null);

  if (role !== "admin") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Только для администраторов</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/knowledge")} style={linkBtn}>База знаний</button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Управление разделами</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0, flex: 1 }}>
          Разделы
        </h1>
        <button onClick={() => setShowCreate(true)} style={primaryBtn}>
          + Создать раздел
        </button>
      </div>

      {showCreate && (
        <div style={{ marginBottom: "20px" }}>
          <CreateForm allSections={sections} onDone={() => setShowCreate(false)} />
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={24} />
        </div>
      ) : sections.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
          Разделов пока нет
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {topSections.map((section) => (
            <SectionRow key={section.id} section={section} allSections={sections} />
          ))}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px" };
const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
const primaryBtn: React.CSSProperties = { padding: "8px 18px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "8px 14px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" };
const iconBtn: React.CSSProperties = { padding: "4px 8px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", borderRadius: "var(--radius-s)", color: "var(--color-text-secondary)" };
const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
