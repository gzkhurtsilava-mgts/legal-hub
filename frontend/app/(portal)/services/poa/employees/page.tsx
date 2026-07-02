"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, IconButton, LinkButton, Select, Badge } from "@/components/ui";
import {
  useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee,
  useOrgScopes, useOrgLevels, useResolve,
  type Employee, type ResolvedDerivation,
} from "@/lib/api/poa";

const DERIVATION: Record<string, string> = {
  base_rule: "Прямое", cascade: "По оргдереву", universal: "Универсальное", manual_exception: "Заявка",
};

function limitLabel(a: { unlimited: boolean; no_limit: boolean; effective_limit: string | null; currency: string | null }) {
  if (a.unlimited) return "Без лимита (доходная)";
  if (a.no_limit) return "Без лимита";
  if (a.effective_limit != null) return `${a.effective_limit} ${a.currency ?? ""}`;
  return "Лимит не задан";
}

function EmployeePowers({ employeeId }: { employeeId: number }) {
  const { data, isLoading } = useResolve(employeeId);
  if (isLoading) return <div style={{ padding: "8px 0" }}><Spinner size={16} /></div>;
  const items = data?.authorities ?? [];
  return (
    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-line)" }}>
      <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
        Доступные полномочия ({items.length})
      </p>
      {items.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
          Нет — проверьте подразделение и уровень сотрудника
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map((a, i) => (
            <div key={a.authority_id ?? `p${i}`} style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-primary)" }}>
                {a.code ? `${a.code} · ` : ""}{a.name_short ?? a.proposed_text ?? "—"}
              </span>
              <Badge tone="neutral">{limitLabel(a)}</Badge>
              <Badge tone="brand">{DERIVATION[a.derivation as ResolvedDerivation] ?? a.derivation}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY = { fio: "", position: "", company: "МГТС", org_scope_id: "", org_level_id: "", tab_number: "" };
type Form = typeof EMPTY;

function EmpForm({ init, onSubmit, onCancel, pending, scopeOpts, levelOpts, submitLabel }: {
  init: Form; onSubmit: (b: Record<string, unknown>) => void; onCancel: () => void;
  pending: boolean; scopeOpts: { value: number; label: string }[]; levelOpts: { value: number; label: string }[];
  submitLabel: string;
}) {
  const [form, setForm] = useState<Form>(init);
  const [error, setError] = useState("");
  const submit = () => {
    if (!form.fio) { setError("Укажите ФИО"); return; }
    setError("");
    onSubmit({
      fio: form.fio, position: form.position || null, company: form.company,
      org_scope_id: form.org_scope_id ? Number(form.org_scope_id) : null,
      org_level_id: form.org_level_id ? Number(form.org_level_id) : null,
      tab_number: form.tab_number || null,
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>ФИО *</label><input style={inp} value={form.fio} onChange={(e) => setForm({ ...form, fio: e.target.value })} /></div>
        <div><label style={lbl}>Должность</label><input style={inp} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
        <div><label style={lbl}>Компания</label><input style={inp} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        <div><label style={lbl}>Подразделение</label>
          <Select value={form.org_scope_id} className="ui-select--inp" onChange={(e) => setForm({ ...form, org_scope_id: e.target.value })} placeholder="—">
            <option value="">—</option>
            {scopeOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div><label style={lbl}>Уровень</label>
          <Select value={form.org_level_id} className="ui-select--inp" onChange={(e) => setForm({ ...form, org_level_id: e.target.value })} placeholder="—">
            <option value="">—</option>
            {levelOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
        <div><label style={lbl}>Табельный №</label><input style={inp} value={form.tab_number} onChange={(e) => setForm({ ...form, tab_number: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Button size="s" onClick={submit} disabled={pending}>{pending ? "…" : submitLabel}</Button>
        <Button size="s" variant="secondary" onClick={onCancel}>Отмена</Button>
        {error && <span style={errText}>{error}</span>}
      </div>
    </div>
  );
}

function EmpRow({ emp, canEdit, scopeOpts, levelOpts }: {
  emp: Employee; canEdit: boolean;
  scopeOpts: { value: number; label: string }[]; levelOpts: { value: number; label: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const update = useUpdateEmployee(emp.id);
  const del = useDeleteEmployee(emp.id);
  const scopeName = scopeOpts.find((o) => o.value === emp.org_scope_id)?.label ?? "—";
  const levelName = levelOpts.find((o) => o.value === emp.org_level_id)?.label ?? "—";

  return (
    <div style={rowCard}>
      {editing ? (
        <EmpForm
          init={{ fio: emp.fio, position: emp.position ?? "", company: emp.company,
            org_scope_id: emp.org_scope_id ? String(emp.org_scope_id) : "",
            org_level_id: emp.org_level_id ? String(emp.org_level_id) : "",
            tab_number: emp.tab_number ?? "" }}
          scopeOpts={scopeOpts} levelOpts={levelOpts} pending={update.isPending} submitLabel="Сохранить"
          onCancel={() => setEditing(false)}
          onSubmit={async (b) => { await update.mutateAsync(b); setEditing(false); }}
        />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>{emp.fio}</span>
              {emp.position && <span style={meta}>{emp.position}</span>}
              <span style={meta}>{emp.company}</span>
              <span style={meta}>{scopeName}</span>
              <Badge tone="brand">{levelName}</Badge>
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <IconButton size={32} onClick={() => setOpen((o) => !o)} label="Полномочия">
                <Icon name={open ? "ArrowUpSize24StyleOutline" : "ArrowDownSize24StyleOutline"} size={16} />
              </IconButton>
              {canEdit && (
                <>
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
                </>
              )}
            </div>
          </div>
          {open && <EmployeePowers employeeId={emp.id} />}
        </>
      )}
    </div>
  );
}

export default function PoaEmployeesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";
  const [showCreate, setShowCreate] = useState(false);

  const employees = useEmployees();
  const scopes = useOrgScopes();
  const levels = useOrgLevels();
  const create = useCreateEmployee();

  const scopeOpts = (scopes.data ?? []).map((s) => ({ value: s.id, label: s.name }));
  const levelOpts = (levels.data ?? []).map((l) => ({ value: l.id, label: l.code }));

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Сотрудники</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <h1 style={{ flex: 1, fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Сотрудники
        </h1>
        {canEdit && !showCreate && (
          <Button onClick={() => setShowCreate(true)} icon={<Icon name="AddUserSize24StyleOutline" size={16} />}>
            Добавить
          </Button>
        )}
      </div>

      {showCreate && canEdit && (
        <div style={{ ...createCard, marginBottom: "16px" }}>
          <p style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "14px", margin: 0, color: "var(--color-text-primary)" }}>Новый сотрудник</p>
          <EmpForm init={EMPTY} scopeOpts={scopeOpts} levelOpts={levelOpts} pending={create.isPending} submitLabel="Создать"
            onCancel={() => setShowCreate(false)}
            onSubmit={async (b) => { await create.mutateAsync(b); setShowCreate(false); }} />
        </div>
      )}

      {employees.isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : (employees.data ?? []).length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          Сотрудников пока нет
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(employees.data ?? []).map((e) => (
            <EmpRow key={e.id} emp={e} canEdit={canEdit} scopeOpts={scopeOpts} levelOpts={levelOpts} />
          ))}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontFamily: "MTS Compact, sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px" };
const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
const meta: React.CSSProperties = { fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-secondary)" };
const rowCard: React.CSSProperties = { background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)", padding: "14px 16px" };
const createCard: React.CSSProperties = { padding: "20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1.5px solid var(--brand-blue)", display: "flex", flexDirection: "column", gap: "12px" };
const errText: React.CSSProperties = { fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-accent-negative)" };
