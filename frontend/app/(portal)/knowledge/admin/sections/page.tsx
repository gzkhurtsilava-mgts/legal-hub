"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useSections, useCreateSection, useUpdateSection, useDeleteSection,
} from "@/lib/api/knowledge";
import type { Section, SectionCreate, SectionUpdate, Visibility } from "@/lib/api/knowledge";
import { Icon } from "@/components/icons";
import { Button, IconButton, LinkButton, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";

const SECTION_ICON_NAMES: Record<string, string> = {
  "file-text": "DocumentSize24StyleOutline",
  scale: "GavelSize24StyleOutline",
  "book-open": "OpenBookSize24StyleOutline",
  lock: "LockSize24StyleOutline",
};

const ICON_OPTIONS: SelectOption[] = [
  { value: "file-text", label: "Документы" },
  { value: "scale",     label: "Право" },
  { value: "book-open", label: "Книга" },
  { value: "lock",      label: "Закрытый" },
  { value: "",          label: "По умолчанию" },
];

const VISIBILITY_OPTIONS: SelectOption[] = [
  { value: "public", label: "Все сотрудники" },
  { value: "bpo_only", label: "Только БПО" },
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
                <Select className="ui-select--compact" value={icon} onChange={(e) => setIcon(e.target.value)} options={ICON_OPTIONS} />
              </div>
              <div>
                <label style={lbl}>Видимость</label>
                <Select className="ui-select--compact" value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} options={VISIBILITY_OPTIONS} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button onClick={handleSave} disabled={update.isPending}>
                {update.isPending ? "…" : "Сохранить"}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Отмена</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ flexShrink: 0, display: "flex", color: "var(--brand-blue)" }}>
              <Icon name={SECTION_ICON_NAMES[section.icon ?? ""] ?? "FolderSize24StyleOutline"} size={20} />
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
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-accent-warning)", background: "var(--color-accent-warning-bg)", padding: "1px 7px", borderRadius: "999px" }}>
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
            <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
              <IconButton
                onClick={() => router.push(`/knowledge/sections/${section.slug}`)}
                label="Открыть раздел"
              >
                <Icon name="ShowSize24StyleOutline" size={16} />
              </IconButton>
              <IconButton onClick={() => setEditing(true)} label="Редактировать">
                <Icon name="EditSize24StyleOutline" size={16} />
              </IconButton>
              {!confirmDelete ? (
                <IconButton danger onClick={() => setConfirmDelete(true)} label="Удалить">
                  <Icon name="DeleteSize24StyleOutline" size={16} />
                </IconButton>
              ) : (
                <>
                  <Button variant="negative" size="xs" onClick={handleDelete} disabled={del.isPending}>
                    {del.isPending ? "…" : "Да"}
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => setConfirmDelete(false)}>Нет</Button>
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

  const parentOptions: SelectOption[] = [
    { value: "", label: "— верхний уровень —" },
    ...allSections.filter((s) => s.parent_id === null).map((s) => ({ value: s.id, label: s.name })),
  ];

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
          <Select
            className="ui-select--compact"
            value={parentId}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : "")}
            options={parentOptions}
          />
        </div>
        <div>
          <label style={lbl}>Иконка</label>
          <Select className="ui-select--compact" value={icon} onChange={(e) => setIcon(e.target.value)} options={ICON_OPTIONS} />
        </div>
        <div>
          <label style={lbl}>Видимость</label>
          <Select className="ui-select--compact" value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} options={VISIBILITY_OPTIONS} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Создание…" : "Создать раздел"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>Отмена</Button>
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
        <LinkButton onClick={() => router.push("/knowledge")}>База знаний</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Управление разделами</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0, flex: 1 }}>
          Разделы
        </h1>
        <Button onClick={() => setShowCreate(true)} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>
          Создать раздел
        </Button>
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
const inp: React.CSSProperties = { width: "100%", height: "36px", padding: "0 12px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
