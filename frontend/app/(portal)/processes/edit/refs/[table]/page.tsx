"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useRefList,
  useCreateRef,
  useUpdateRef,
  useDeleteRef,
  type RefTable,
} from "@/lib/api/processes";

// ─── Table config ─────────────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface FieldDef {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "date" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface TableConfig {
  label: string;
  description: string;
  columns: ColDef[];
  fields: FieldDef[];
  defaultValues?: Record<string, unknown>;
}

const BU_TYPE_LABEL: Record<string, string> = {
  client: "Клиент",
  self: "БПО",
  oversight: "Надзор / Контроль",
};

const TABLE_CONFIG: Record<string, TableConfig> = {
  roles: {
    label: "Роли",
    description: "Должности и роли участников процессов",
    columns: [
      { key: "name", label: "Название" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "Юрисконсульт" },
      { name: "description", label: "Описание", type: "textarea", placeholder: "Краткое описание роли" },
    ],
  },
  systems: {
    label: "ИТ-системы",
    description: "Корпоративные системы, задействованные в процессах",
    columns: [
      { key: "name", label: "Название" },
      { key: "type", label: "Тип" },
      { key: "url", label: "URL" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "СЭД «Директум»" },
      { name: "type", label: "Тип системы", placeholder: "СЭД / CRM / ERP / …" },
      { name: "url", label: "URL / ссылка", placeholder: "https://..." },
      { name: "description", label: "Описание", type: "textarea" },
    ],
  },
  regulations: {
    label: "Нормативные акты",
    description: "Законы, регламенты, ГОСТы, стандарты",
    columns: [
      { key: "name", label: "Название" },
      { key: "effective_date", label: "Дата вступления" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "44-ФЗ «О контрактной системе»" },
      { name: "effective_date", label: "Дата вступления в силу", type: "date" },
      { name: "description", label: "Описание", type: "textarea" },
    ],
  },
  policies: {
    label: "Политики",
    description: "Внутренние политики и стандарты МГТС / БПО",
    columns: [
      { key: "name", label: "Название" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "Политика управления договорами" },
      { name: "description", label: "Описание", type: "textarea" },
    ],
  },
  risks: {
    label: "Риски",
    description: "Операционные, правовые и регуляторные риски",
    columns: [
      { key: "name", label: "Название" },
      { key: "category", label: "Категория" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "Нарушение сроков согласования" },
      { name: "category", label: "Категория", placeholder: "Операционный / Правовой / Регуляторный…" },
      { name: "description", label: "Описание", type: "textarea" },
    ],
  },
  "doc-types": {
    label: "Типы документов",
    description: "Классификация документов для процессов",
    columns: [
      { key: "name", label: "Название" },
      { key: "description", label: "Описание" },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "Договор / Доверенность / Приказ…" },
      { name: "description", label: "Описание", type: "textarea" },
    ],
  },
  "business-units": {
    label: "Бизнес-юниты",
    description: "Подразделения МГТС — клиенты, надзорные органы, сам БПО",
    columns: [
      { key: "name", label: "Название" },
      {
        key: "type",
        label: "Тип",
        render: (row) => BU_TYPE_LABEL[(row.type as string) ?? ""] ?? (row.type as string),
      },
    ],
    fields: [
      { name: "name", label: "Название", required: true, placeholder: "Коммерческий блок" },
      {
        name: "type",
        label: "Тип",
        type: "select",
        options: [
          { value: "client", label: "Клиент" },
          { value: "self", label: "БПО (сам правовой блок)" },
          { value: "oversight", label: "Надзорный / контроль" },
        ],
      },
    ],
    defaultValues: { type: "client" },
  },
};

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  item: Record<string, unknown>;
  config: TableConfig;
  table: RefTable;
}

function RefRow({ item, config, table }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      init[f.name] = item[f.name] ?? config.defaultValues?.[f.name] ?? "";
    });
    return init;
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useUpdateRef<Record<string, unknown>>(table, item.id as number);
  const del = useDeleteRef(table, item.id as number);

  const handleSave = async () => {
    const body: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      const v = form[f.name];
      body[f.name] = v === "" ? null : v;
    });
    await update.mutateAsync(body);
    setEditing(false);
  };

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--radius-m)",
        border: "1px solid var(--color-background-lower)",
        padding: "14px 16px",
      }}
    >
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: config.fields.length > 2 ? "1fr 1fr" : "1fr",
              gap: "10px",
            }}
          >
            {config.fields.map((f) => (
              <div key={f.name}>
                <label style={lbl}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    value={(form[f.name] as string) ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    rows={2}
                    style={{ ...inp, resize: "vertical" }}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={(form[f.name] as string) ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    style={inp}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={(form[f.name] as string) ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    style={inp}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSave} disabled={update.isPending} style={primaryBtn}>
              {update.isPending ? "…" : "Сохранить"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                config.fields.forEach((f) => {
                  form[f.name] = item[f.name] ?? "";
                });
              }}
              style={secondaryBtn}
            >
              Отмена
            </button>
            {update.isError && (
              <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)", alignSelf: "center" }}>
                {(update.error as Error)?.message ?? "Ошибка сохранения"}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {config.columns.map((col) => (
                <span
                  key={col.key}
                  style={{
                    fontFamily: "MTS Compact",
                    fontSize: col.key === "name" ? "14px" : "12px",
                    fontWeight: col.key === "name" ? 500 : 400,
                    color: col.key === "name" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: col.key === "name" ? "nowrap" : undefined,
                  }}
                >
                  {col.render
                    ? col.render(item)
                    : col.key === "description" || col.key === "url"
                    ? (item[col.key] as string | null) ?? "—"
                    : (item[col.key] as string | null) ?? "—"}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={iconBtn} title="Редактировать">
              ✏️
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ ...iconBtn, color: "var(--color-accent-negative)" }}
                title="Удалить"
              >
                🗑
              </button>
            ) : (
              <>
                <button
                  onClick={async () => {
                    await del.mutateAsync();
                    setConfirmDelete(false);
                  }}
                  disabled={del.isPending}
                  style={{ ...iconBtn, color: "var(--color-accent-negative)", fontWeight: 700 }}
                >
                  {del.isPending ? "…" : "Удалить"}
                </button>
                <button onClick={() => setConfirmDelete(false)} style={iconBtn}>
                  Нет
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

interface CreateFormProps {
  config: TableConfig;
  table: RefTable;
  onDone: () => void;
}

function CreateForm({ config, table, onDone }: CreateFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      init[f.name] = config.defaultValues?.[f.name] ?? "";
    });
    return init;
  });
  const create = useCreateRef<Record<string, unknown>>(table);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = config.fields.find((f) => f.required && !form[f.name]);
    if (required) return;
    const body: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      const v = form[f.name];
      body[f.name] = v === "" ? null : v;
    });
    await create.mutateAsync(body);
    onDone();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "20px",
        background: "var(--color-background-primary)",
        borderRadius: "var(--radius-m)",
        border: "1.5px solid var(--brand-blue)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "16px",
      }}
    >
      <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)", margin: 0 }}>
        Новая запись
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: config.fields.length > 2 ? "1fr 1fr" : "1fr",
          gap: "10px",
        }}
      >
        {config.fields.map((f) => (
          <div key={f.name}>
            <label style={lbl}>
              {f.label}
              {f.required && <span style={{ color: "var(--color-accent-negative)" }}> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={(form[f.name] as string) ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                rows={2}
                style={{ ...inp, resize: "vertical" }}
                placeholder={f.placeholder}
                required={f.required}
              />
            ) : f.type === "select" ? (
              <select
                value={(form[f.name] as string) ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                style={inp}
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type ?? "text"}
                value={(form[f.name] as string) ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                style={inp}
                placeholder={f.placeholder}
                required={f.required}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button type="submit" disabled={create.isPending} style={primaryBtn}>
          {create.isPending ? "Создание…" : "Создать"}
        </button>
        <button type="button" onClick={onDone} style={secondaryBtn}>
          Отмена
        </button>
        {create.isError && (
          <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)" }}>
            {(create.error as Error)?.message ?? "Ошибка"}
          </span>
        )}
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RefTablePage() {
  const params = useParams();
  const table = params.table as string;
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const config = TABLE_CONFIG[table];
  const { data: items = [], isLoading } = useRefList<Record<string, unknown>>(
    table as RefTable,
    search || undefined
  );

  if (!config) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>
          Неизвестный справочник: {table}
        </p>
        <button onClick={() => router.push("/processes/edit/refs")} style={linkBtn}>
          ← Все справочники
        </button>
      </div>
    );
  }

  const canEdit = role === "admin" || role === "lawyer";

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          Карта процессов
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>
          Редактирование
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <button onClick={() => router.push("/processes/edit/refs")} style={linkBtn}>
          Справочники
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {config.label}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "MTS Wide",
              fontWeight: 700,
              fontSize: "24px",
              color: "var(--color-text-primary)",
              margin: "0 0 4px",
            }}
          >
            {config.label}
          </h1>
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
            {config.description}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setShowCreate(true)} style={primaryBtn}>
            + Добавить
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию…"
          style={{ ...inp, maxWidth: "320px" }}
        />
      </div>

      {/* Create form */}
      {showCreate && canEdit && (
        <CreateForm config={config} table={table as RefTable} onDone={() => setShowCreate(false)} />
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={24} />
        </div>
      ) : items.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
          {search ? "Ничего не найдено" : "Записей нет — добавьте первую"}
        </p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", padding: "0 16px" }}>
            {config.columns.map((col) => (
              <span
                key={col.key}
                style={{
                  fontFamily: "MTS Compact",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  flex: col.key === "name" ? 2 : 1,
                }}
              >
                {col.label}
              </span>
            ))}
            <span style={{ width: "80px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {items.map((item) => (
              <RefRow
                key={item.id as number}
                item={item}
                config={config}
                table={table as RefTable}
              />
            ))}
          </div>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "16px" }}>
            Всего записей: {items.length}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const lbl: React.CSSProperties = {
  display: "block",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  marginBottom: "4px",
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-text-primary)",
  background: "var(--color-background-secondary)",
  border: "1px solid var(--color-background-lower)",
  borderRadius: "var(--radius-m)",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 18px",
  background: "var(--brand-blue)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const secondaryBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  cursor: "pointer",
};

const iconBtn: React.CSSProperties = {
  padding: "4px 8px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  borderRadius: "var(--radius-s)",
  color: "var(--color-text-secondary)",
};

const linkBtn: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "14px",
  color: "var(--brand-blue)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
