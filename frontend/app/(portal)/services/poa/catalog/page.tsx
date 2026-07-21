"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, IconButton, LinkButton, Select, Checkbox, SegmentedControl } from "@/components/ui";
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useAuthorities, useCreateAuthority, useUpdateAuthority, useDeleteAuthority,
  useOrgScopes, useCreateOrgScope, useUpdateOrgScope, useDeleteOrgScope,
  useOrgLevels, useCreateOrgLevel, useUpdateOrgLevel, useDeleteOrgLevel,
  useLimitRules, useCreateLimitRule, useUpdateLimitRule, useDeleteLimitRule,
} from "@/lib/api/poa";

// ─── Generic CRUD building blocks ─────────────────────────────────────────────

type Body = Record<string, unknown>;
type MutationLike = {
  mutateAsync: (b: Body) => Promise<unknown>;
  isPending: boolean;
  isError: boolean;
  error: unknown;
};
type DeleteLike = { mutateAsync: () => Promise<unknown>; isPending: boolean };

interface Opt {
  value: string | number;
  label: string;
}
interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: Opt[];
  numeric?: boolean; // для select с id
  half?: boolean; // занимать половину ширины в grid
}
interface ColDef {
  key: string;
  label: string;
  render?: (row: Body) => React.ReactNode;
}

function serialize(fields: FieldDef[], form: Body): Body {
  const body: Body = {};
  for (const f of fields) {
    const v = form[f.name];
    if (f.type === "checkbox") body[f.name] = !!v;
    else if (f.type === "number" || (f.type === "select" && f.numeric))
      body[f.name] = v === "" || v == null ? null : Number(v);
    else body[f.name] = v === "" ? null : v;
  }
  return body;
}

function FieldInput({
  field, value, onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "checkbox")
    return <Checkbox checked={!!value} onChange={onChange} label={field.label} />;
  if (field.type === "textarea")
    return (
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...inp, resize: "vertical" }}
        placeholder={field.placeholder}
      />
    );
  if (field.type === "select")
    return (
      <Select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="ui-select--inp"
        placeholder="—"
      >
        <option value="">—</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    );
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={inp}
      placeholder={field.placeholder}
    />
  );
}

function FormFields({
  fields, form, setForm,
}: {
  fields: FieldDef[];
  form: Body;
  setForm: (f: Body) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {fields.map((f) => (
        <div key={f.name} style={{ gridColumn: f.half ? "auto" : "1 / -1" }}>
          {f.type !== "checkbox" && (
            <label style={lbl}>
              {f.label}
              {f.required && <span style={{ color: "var(--color-accent-negative)" }}> *</span>}
            </label>
          )}
          <FieldInput
            field={f}
            value={form[f.name]}
            onChange={(v) => setForm({ ...form, [f.name]: v })}
          />
        </div>
      ))}
    </div>
  );
}

interface SectionProps {
  items: Body[];
  columns: ColDef[];
  fields: FieldDef[];
  defaults?: Body;
  useCreate: () => MutationLike;
  useUpdate: (id: number) => MutationLike;
  useDelete: (id: number) => DeleteLike;
  canEdit: boolean;
  isLoading: boolean;
}

function initForm(fields: FieldDef[], item: Body, defaults?: Body): Body {
  const f: Body = {};
  for (const fd of fields) {
    const raw = item[fd.name] ?? defaults?.[fd.name];
    f[fd.name] = fd.type === "checkbox" ? !!raw : (raw ?? "");
  }
  return f;
}

function CrudRow({ item, columns, fields, useUpdate, useDelete, canEdit }: {
  item: Body;
  columns: ColDef[];
  fields: FieldDef[];
  useUpdate: (id: number) => MutationLike;
  useDelete: (id: number) => DeleteLike;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState<Body>(() => initForm(fields, item));
  const [validationError, setValidationError] = useState("");
  const update = useUpdate(item.id as number);
  const del = useDelete(item.id as number);

  const save = async () => {
    // Та же проверка обязательных полей, что и при создании: очищенное поле
    // иначе уйдёт null'ом в NOT NULL-колонку.
    const miss = fields.find((f) => f.required && !form[f.name]);
    if (miss) {
      setValidationError(`Заполните поле «${miss.label}»`);
      return;
    }
    setValidationError("");
    await update.mutateAsync(serialize(fields, form));
    setEditing(false);
  };

  return (
    <div style={rowCard}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <FormFields fields={fields} form={form} setForm={setForm} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button size="s" onClick={save} disabled={update.isPending}>
              {update.isPending ? "…" : "Сохранить"}
            </Button>
            <Button size="s" variant="secondary" onClick={() => { setEditing(false); setForm(initForm(fields, item)); }}>
              Отмена
            </Button>
            {validationError && <span style={errText}>{validationError}</span>}
            {update.isError && (
              <span style={errText}>{(update.error as Error)?.message ?? "Ошибка"}</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {columns.map((c) => (
              <span key={c.key} style={{
                fontFamily: "MTS Compact, sans-serif",
                fontSize: c.key === columns[0].key ? "14px" : "12px",
                fontWeight: c.key === columns[0].key ? 500 : 400,
                color: c.key === columns[0].key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {c.render ? c.render(item) : ((item[c.key] as string | null) ?? "—")}
              </span>
            ))}
          </div>
          {canEdit && (
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <IconButton size={32} onClick={() => setEditing(true)} label="Редактировать">
                <Icon name="EditSize24StyleOutline" size={16} />
              </IconButton>
              {!confirm ? (
                <IconButton size={32} danger onClick={() => setConfirm(true)} label="Удалить">
                  <Icon name="DeleteSize24StyleOutline" size={16} />
                </IconButton>
              ) : (
                <>
                  <Button size="xs" variant="negative" disabled={del.isPending}
                    onClick={async () => { await del.mutateAsync(); setConfirm(false); }}>
                    {del.isPending ? "…" : "Удалить"}
                  </Button>
                  <Button size="xs" variant="secondary" onClick={() => setConfirm(false)}>Нет</Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CrudSection({ items, columns, fields, defaults, useCreate, useUpdate, useDelete, canEdit, isLoading }: SectionProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<Body>(() => initForm(fields, {}, defaults));
  const [error, setError] = useState("");
  const create = useCreate();

  const submit = async () => {
    const miss = fields.find((f) => f.required && !form[f.name]);
    if (miss) { setError(`Заполните поле «${miss.label}»`); return; }
    setError("");
    await create.mutateAsync(serialize(fields, form));
    setForm(initForm(fields, {}, defaults));
    setShowCreate(false);
  };

  return (
    <div>
      {canEdit && (
        <div style={{ marginBottom: "16px" }}>
          {!showCreate ? (
            <Button size="s" onClick={() => setShowCreate(true)} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>
              Добавить
            </Button>
          ) : (
            <div style={createCard}>
              <p style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "14px", margin: 0, color: "var(--color-text-primary)" }}>
                Новая запись
              </p>
              <FormFields fields={fields} form={form} setForm={setForm} />
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Button size="s" onClick={submit} disabled={create.isPending}>
                  {create.isPending ? "Создание…" : "Создать"}
                </Button>
                <Button size="s" variant="secondary" onClick={() => { setShowCreate(false); setError(""); }}>
                  Отмена
                </Button>
                {(error || create.isError) && (
                  <span style={errText}>{error || (create.error as Error)?.message || "Ошибка"}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : items.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          Записей нет
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map((it) => (
            <CrudRow key={it.id as number} item={it} columns={columns} fields={fields}
              useUpdate={useUpdate} useDelete={useDelete} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Label maps ────────────────────────────────────────────────────────────

const KIND: Record<string, string> = { deal: "Сделки", representation: "Представительство", action: "Действия" };
const DIRECTION: Record<string, string> = { expense: "Расходная", income: "Доходная", na: "—" };
const STATUS: Record<string, string> = { draft: "Черновик", active: "Активно", archived: "Архив" };
const SCOPE_TYPE: Record<string, string> = {
  metablock: "Метаблок", block: "Блок", department: "Департамент", division: "Отдел", unit: "Подразделение",
};
const SOURCE: Record<string, string> = { manual: "Вручную", hrgate: "HRGate" };

const KIND_OPTS: Opt[] = Object.entries(KIND).map(([value, label]) => ({ value, label }));
const DIR_OPTS: Opt[] = Object.entries(DIRECTION).map(([value, label]) => ({ value, label }));
const STATUS_OPTS: Opt[] = Object.entries(STATUS).map(([value, label]) => ({ value, label }));
const SCOPE_OPTS: Opt[] = Object.entries(SCOPE_TYPE).map(([value, label]) => ({ value, label }));
const SOURCE_OPTS: Opt[] = Object.entries(SOURCE).map(([value, label]) => ({ value, label }));

const TABS = [
  { value: "authorities", label: "Полномочия" },
  { value: "categories", label: "Категории" },
  { value: "scopes", label: "Подразделения" },
  { value: "levels", label: "Уровни" },
  { value: "limits", label: "Лимиты" },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PoaCatalogPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";
  const [tab, setTab] = useState("authorities");

  const categories = useCategories();
  const authorities = useAuthorities();
  const scopes = useOrgScopes();
  const levels = useOrgLevels();
  const limits = useLimitRules();

  const catOpts: Opt[] = (categories.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  const scopeOpts: Opt[] = (scopes.data ?? []).map((s) => ({ value: s.id, label: s.name }));
  const levelOpts: Opt[] = (levels.data ?? []).map((l) => ({ value: l.id, label: l.code }));
  const catName = (id: unknown) => catOpts.find((o) => o.value === id)?.label ?? "—";
  const levelName = (id: unknown) => levelOpts.find((o) => o.value === id)?.label ?? "—";

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Каталог
        </span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 20px" }}>
        Каталог полномочий
      </h1>

      <div style={{ marginBottom: "24px" }}>
        <SegmentedControl segments={TABS} value={tab} onChange={setTab} size="s" />
      </div>

      {tab === "authorities" && (
        <CrudSection
          canEdit={canEdit} isLoading={authorities.isLoading}
          items={(authorities.data ?? []) as unknown as Body[]}
          columns={[
            { key: "code", label: "Код" },
            { key: "name_short", label: "Название" },
            { key: "authority_kind", label: "Вид", render: (r) => KIND[r.authority_kind as string] ?? "—" },
            { key: "status", label: "Статус", render: (r) => STATUS[r.status as string] ?? "—" },
          ]}
          defaults={{ authority_kind: "action", deal_direction: "na", status: "draft" }}
          fields={[
            { name: "code", label: "Код", required: true, placeholder: "POA-DEAL-013", half: true },
            { name: "category_id", label: "Категория", type: "select", numeric: true, options: catOpts, half: true },
            { name: "name_short", label: "Название (для UI)", required: true },
            { name: "text_full", label: "Формулировка для тела доверенности", type: "textarea", required: true },
            { name: "authority_kind", label: "Вид", type: "select", options: KIND_OPTS, half: true },
            { name: "deal_direction", label: "Направление", type: "select", options: DIR_OPTS, half: true },
            { name: "status", label: "Статус", type: "select", options: STATUS_OPTS, half: true },
            { name: "legal_basis", label: "Основание", half: true },
            { name: "is_universal", label: "Универсальное (всем)", type: "checkbox", half: true },
            { name: "limit_applies", label: "Под финансовым лимитом", type: "checkbox", half: true },
            { name: "is_no_limit", label: "Без лимита (зелёное)", type: "checkbox", half: true },
          ]}
          useCreate={useCreateAuthority} useUpdate={useUpdateAuthority} useDelete={useDeleteAuthority}
        />
      )}

      {tab === "categories" && (
        <CrudSection
          canEdit={canEdit} isLoading={categories.isLoading}
          items={(categories.data ?? []) as unknown as Body[]}
          columns={[
            { key: "name", label: "Название" },
            { key: "level", label: "Уровень", render: (r) => `H${r.level}` },
            { key: "parent_id", label: "Родитель", render: (r) => catName(r.parent_id) },
          ]}
          defaults={{ level: 1, sort_order: 0 }}
          fields={[
            { name: "name", label: "Название", required: true, half: true },
            { name: "level", label: "Уровень (1–5)", type: "number", required: true, half: true },
            { name: "parent_id", label: "Родительская категория", type: "select", numeric: true, options: catOpts, half: true },
            { name: "sort_order", label: "Порядок", type: "number", half: true },
          ]}
          useCreate={useCreateCategory} useUpdate={useUpdateCategory} useDelete={useDeleteCategory}
        />
      )}

      {tab === "scopes" && (
        <CrudSection
          canEdit={canEdit} isLoading={scopes.isLoading}
          items={(scopes.data ?? []) as unknown as Body[]}
          columns={[
            { key: "name", label: "Название" },
            { key: "scope_type", label: "Тип", render: (r) => SCOPE_TYPE[r.scope_type as string] ?? "—" },
            { key: "company", label: "Компания" },
            { key: "source", label: "Источник", render: (r) => SOURCE[r.source as string] ?? "—" },
          ]}
          defaults={{ scope_type: "department", company: "МГТС", source: "manual" }}
          fields={[
            { name: "name", label: "Название", required: true, half: true },
            { name: "scope_type", label: "Тип узла", type: "select", options: SCOPE_OPTS, half: true },
            { name: "company", label: "Компания", required: true, half: true },
            { name: "parent_id", label: "Родительский узел", type: "select", numeric: true, options: scopeOpts, half: true },
            { name: "source", label: "Источник", type: "select", options: SOURCE_OPTS, half: true },
            { name: "external_id", label: "Внешний ID (HRGate)", half: true },
          ]}
          useCreate={useCreateOrgScope} useUpdate={useUpdateOrgScope} useDelete={useDeleteOrgScope}
        />
      )}

      {tab === "levels" && (
        <CrudSection
          canEdit={canEdit} isLoading={levels.isLoading}
          items={(levels.data ?? []) as unknown as Body[]}
          columns={[
            { key: "code", label: "Код" },
            { key: "rank", label: "Ранг" },
          ]}
          fields={[
            { name: "code", label: "Код", required: true, placeholder: "CEO-1", half: true },
            { name: "rank", label: "Ранг", type: "number", required: true, placeholder: "1", half: true },
          ]}
          useCreate={useCreateOrgLevel} useUpdate={useUpdateOrgLevel} useDelete={useDeleteOrgLevel}
        />
      )}

      {tab === "limits" && (
        <CrudSection
          canEdit={canEdit} isLoading={limits.isLoading}
          items={(limits.data ?? []) as unknown as Body[]}
          columns={[
            { key: "org_level_id", label: "Уровень", render: (r) => levelName(r.org_level_id) },
            { key: "amount", label: "Лимит", render: (r) => `${r.amount} ${r.currency ?? ""}` },
          ]}
          defaults={{ currency: "RUB" }}
          fields={[
            { name: "org_level_id", label: "Уровень", type: "select", numeric: true, required: true, options: levelOpts, half: true },
            { name: "amount", label: "Сумма лимита", type: "number", required: true, half: true },
            { name: "currency", label: "Валюта", half: true },
          ]}
          useCreate={useCreateLimitRule} useUpdate={useUpdateLimitRule} useDelete={useDeleteLimitRule}
        />
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const lbl: React.CSSProperties = {
  display: "block", fontFamily: "MTS Compact, sans-serif", fontSize: "12px",
  fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "7px 10px", fontFamily: "MTS Compact, sans-serif", fontSize: "13px",
  color: "var(--color-text-primary)", background: "var(--color-background-secondary)",
  border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)",
  outline: "none", boxSizing: "border-box",
};
const rowCard: React.CSSProperties = {
  background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)", padding: "14px 16px",
};
const createCard: React.CSSProperties = {
  padding: "20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1.5px solid var(--brand-blue)", display: "flex", flexDirection: "column", gap: "12px",
};
const errText: React.CSSProperties = {
  fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-accent-negative)",
};
