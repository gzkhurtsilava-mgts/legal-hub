"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, LinkButton, Select, Badge, SegmentedControl } from "@/components/ui";
import {
  useRequests, useCreateRequest, useDecideRequest, useEmployees, useAuthorities,
  type RequestStatus,
} from "@/lib/api/poa";

const STATUS_LABEL: Record<string, string> = {
  pending: "На рассмотрении", approved: "Одобрена", rejected: "Отклонена",
};
const STATUS_TONE: Record<string, "warning" | "positive" | "negative"> = {
  pending: "warning", approved: "positive", rejected: "negative",
};
const TABS = [
  { value: "", label: "Все" },
  { value: "pending", label: "На рассмотрении" },
  { value: "approved", label: "Одобренные" },
  { value: "rejected", label: "Отклонённые" },
];

export default function PoaRequestsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: requests = [], isLoading } = useRequests((status || undefined) as RequestStatus | undefined);
  const employees = useEmployees();
  const authorities = useAuthorities();
  const create = useCreateRequest();
  const decide = useDecideRequest();

  const empMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of employees.data ?? []) m.set(e.id, e.fio);
    return m;
  }, [employees.data]);
  const authMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const a of authorities.data ?? []) m.set(a.id, `${a.code} · ${a.name_short}`);
    return m;
  }, [authorities.data]);

  const [form, setForm] = useState({ employee_id: "", authority_id: "", proposed_text: "", justification: "" });
  const [error, setError] = useState("");
  const submit = async () => {
    if (!form.employee_id) { setError("Выберите сотрудника"); return; }
    if (!form.authority_id && !form.proposed_text) { setError("Выберите полномочие или впишите текст"); return; }
    setError("");
    await create.mutateAsync({
      employee_id: Number(form.employee_id),
      authority_id: form.authority_id ? Number(form.authority_id) : null,
      proposed_text: form.proposed_text || null,
      justification: form.justification || null,
    });
    setForm({ employee_id: "", authority_id: "", proposed_text: "", justification: "" });
    setShowCreate(false);
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Заявки</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <h1 style={{ flex: 1, fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Заявки на полномочия
        </h1>
        {canEdit && !showCreate && (
          <Button onClick={() => setShowCreate(true)} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>Добавить</Button>
        )}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <SegmentedControl segments={TABS} value={status} onChange={setStatus} size="s" />
      </div>

      {showCreate && canEdit && (
        <div style={createCard}>
          <p style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "14px", margin: 0, color: "var(--color-text-primary)" }}>Новая заявка</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div><label style={lbl}>Сотрудник *</label>
              <Select value={form.employee_id} className="ui-select--inp" onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="—">
                <option value="">—</option>
                {(employees.data ?? []).map((e) => <option key={e.id} value={e.id}>{e.fio}</option>)}
              </Select>
            </div>
            <div><label style={lbl}>Полномочие из каталога</label>
              <Select value={form.authority_id} className="ui-select--inp" onChange={(e) => setForm({ ...form, authority_id: e.target.value })} placeholder="—">
                <option value="">—</option>
                {(authorities.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.code} · {a.name_short}</option>)}
              </Select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Или предложить новое (текст)</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={form.proposed_text}
                onChange={(e) => setForm({ ...form, proposed_text: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Обоснование</label>
              <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button size="s" onClick={submit} disabled={create.isPending}>{create.isPending ? "Создание…" : "Создать"}</Button>
            <Button size="s" variant="secondary" onClick={() => { setShowCreate(false); setError(""); }}>Отмена</Button>
            {error && <span style={errText}>{error}</span>}
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : requests.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          Заявок нет
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: showCreate ? "16px" : 0 }}>
          {requests.map((r) => (
            <div key={r.id} style={rowCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {empMap.get(r.employee_id) ?? `Сотрудник #${r.employee_id}`}
                  </span>
                  <span style={meta}>
                    {r.authority_id ? (authMap.get(r.authority_id) ?? `#${r.authority_id}`) : (r.proposed_text ?? "—")}
                  </span>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  {r.approver && <span style={meta}>{r.approver}</span>}
                </div>
                {canEdit && r.status === "pending" && (
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <Button size="xs" disabled={decide.isPending}
                      onClick={() => decide.mutateAsync({ id: r.id, action: "approve" })}
                      icon={<Icon name="CheckSize24StyleOutline" size={14} />}>Одобрить</Button>
                    <Button size="xs" variant="secondary" disabled={decide.isPending}
                      onClick={() => decide.mutateAsync({ id: r.id, action: "reject" })}>Отклонить</Button>
                  </div>
                )}
              </div>
              {r.justification && <p style={{ ...meta, marginTop: "6px" }}>{r.justification}</p>}
            </div>
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
const createCard: React.CSSProperties = { padding: "20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1.5px solid var(--brand-blue)", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" };
const errText: React.CSSProperties = { fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-accent-negative)" };
