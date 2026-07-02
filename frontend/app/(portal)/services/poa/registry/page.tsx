"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import {
  Button, IconButton, LinkButton, Select, Checkbox, Badge, SegmentedControl, DatePicker,
} from "@/components/ui";
import {
  useRegistry, useCreateCertificate, useRevokeCertificate,
  useAuthorities, useOriginalIssues, useAddOriginalIssue,
  type Certificate, type CertificateStatus,
} from "@/lib/api/poa";

const CERT_TYPE: Record<string, string> = { paper: "Бумажная", notarial: "Нотариальная", mchd: "МЧД" };
const METHOD: Record<string, string> = { in_person: "Лично", ring_mail: "Кольцевая почта", postal: "Почта России" };
const STATUS_LABEL: Record<string, string> = { active: "Действует", revoked: "Отозвана", expired: "Истекла" };
const STATUS_TONE: Record<string, "positive" | "negative" | "neutral"> = {
  active: "positive", revoked: "negative", expired: "neutral",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ─── Original issues (expandable per certificate) ─────────────────────────────

function OriginalIssues({ certId, canEdit }: { certId: number; canEdit: boolean }) {
  const { data: issues = [], isLoading } = useOriginalIssues(certId);
  const add = useAddOriginalIssue(certId);
  const [form, setForm] = useState({
    recipient_fio: "", issued_date: "", method: "in_person", confirmed: false, confirmation_note: "",
  });
  const [adding, setAdding] = useState(false);

  const submit = async () => {
    if (!form.recipient_fio || !form.issued_date) return;
    await add.mutateAsync({
      recipient_fio: form.recipient_fio, issued_date: form.issued_date,
      method: form.method, confirmed: form.confirmed,
      confirmation_note: form.confirmation_note || null,
    });
    setForm({ recipient_fio: "", issued_date: "", method: "in_person", confirmed: false, confirmation_note: "" });
    setAdding(false);
  };

  return (
    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-line)" }}>
      <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
        Выдача оригинала
      </p>
      {isLoading ? (
        <Spinner size={16} />
      ) : issues.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "0 0 8px" }}>
          Оригинал ещё не выдавался
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
          {issues.map((i) => (
            <div key={i.id} style={{ display: "flex", gap: "12px", alignItems: "center", fontFamily: "MTS Compact, sans-serif", fontSize: "12px" }}>
              <span style={{ color: "var(--color-text-primary)" }}>{i.recipient_fio}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>{fmtDate(i.issued_date)}</span>
              <span style={{ color: "var(--color-text-secondary)" }}>{METHOD[i.method] ?? i.method}</span>
              {i.confirmed && <Badge tone="positive">Получено</Badge>}
            </div>
          ))}
        </div>
      )}
      {canEdit && (adding ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxWidth: "560px" }}>
          <input style={inp} placeholder="ФИО получателя" value={form.recipient_fio}
            onChange={(e) => setForm({ ...form, recipient_fio: e.target.value })} />
          <DatePicker value={form.issued_date} className="ui-select--inp"
            onChange={(e) => setForm({ ...form, issued_date: e.target.value })} />
          <Select value={form.method} className="ui-select--inp"
            onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {Object.entries(METHOD).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox checked={form.confirmed} onChange={(v) => setForm({ ...form, confirmed: v })} label="Получено" />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px" }}>
            <Button size="xs" onClick={submit} disabled={add.isPending}>{add.isPending ? "…" : "Записать выдачу"}</Button>
            <Button size="xs" variant="secondary" onClick={() => setAdding(false)}>Отмена</Button>
          </div>
        </div>
      ) : (
        <LinkButton onClick={() => setAdding(true)} icon={<Icon name="PlusSize24StyleOutline" size={14} />}>
          Записать выдачу оригинала
        </LinkButton>
      ))}
    </div>
  );
}

// ─── Certificate row ──────────────────────────────────────────────────────────

function CertRow({ cert, canEdit }: { cert: Certificate; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const revoke = useRevokeCertificate();

  return (
    <div style={rowCard}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
              № {cert.number}
            </span>
            <Badge tone={STATUS_TONE[cert.status]}>{STATUS_LABEL[cert.status]}</Badge>
            <span style={meta}>{cert.grantee_fio}</span>
            <span style={meta}>{CERT_TYPE[cert.cert_type]}</span>
            <span style={meta}>выдана {fmtDate(cert.issued_date)}</span>
            {cert.valid_to && <span style={meta}>до {fmtDate(cert.valid_to)}</span>}
            <span style={meta}>{cert.authorities.length} полн.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <IconButton size={32} onClick={() => setOpen((o) => !o)} label="Подробнее">
            <Icon name={open ? "ArrowUpSize24StyleOutline" : "ArrowDownSize24StyleOutline"} size={16} />
          </IconButton>
          {canEdit && cert.status !== "revoked" && (
            !confirm ? (
              <IconButton size={32} danger onClick={() => setConfirm(true)} label="Отозвать">
                <Icon name="DeleteSize24StyleOutline" size={16} />
              </IconButton>
            ) : (
              <>
                <Button size="xs" variant="negative" disabled={revoke.isPending}
                  onClick={async () => { await revoke.mutateAsync(cert.id); setConfirm(false); }}>
                  {revoke.isPending ? "…" : "Отозвать"}
                </Button>
                <Button size="xs" variant="secondary" onClick={() => setConfirm(false)}>Нет</Button>
              </>
            )
          )}
        </div>
      </div>
      {open && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {cert.authorities.map((a) => (
              <Badge key={a.id} tone="brand">{a.code} · {a.name_short}</Badge>
            ))}
          </div>
          {cert.signer && <p style={{ ...meta, marginTop: "8px" }}>Подписант: {cert.signer}</p>}
          <OriginalIssues certId={cert.id} canEdit={canEdit} />
        </div>
      )}
    </div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateCert({ onDone }: { onDone: () => void }) {
  const create = useCreateCertificate();
  const { data: authorities = [] } = useAuthorities();
  const active = authorities.filter((a) => a.status === "active");
  const [form, setForm] = useState({
    number: "", grantor_company: "МГТС", grantee_fio: "", grantee_position: "",
    cert_type: "paper", issued_date: "", valid_to: "", signer: "",
  });
  const [picked, setPicked] = useState<number[]>([]);
  const [error, setError] = useState("");

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!form.number || !form.grantee_fio || !form.issued_date) {
      setError("Заполните номер, ФИО и дату выдачи"); return;
    }
    setError("");
    try {
      await create.mutateAsync({
        number: form.number, grantor_company: form.grantor_company, grantee_fio: form.grantee_fio,
        grantee_position: form.grantee_position || null, cert_type: form.cert_type,
        issued_date: form.issued_date, valid_to: form.valid_to || null,
        signer: form.signer || null, authority_ids: picked,
      });
      onDone();
    } catch (e) {
      setError((e as Error)?.message ?? "Ошибка");
    }
  };

  return (
    <div style={createCard}>
      <p style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "14px", margin: 0, color: "var(--color-text-primary)" }}>
        Новая доверенность
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div><label style={lbl}>Номер *</label><input style={inp} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="2026-118" /></div>
        <div><label style={lbl}>Доверитель</label><input style={inp} value={form.grantor_company} onChange={(e) => setForm({ ...form, grantor_company: e.target.value })} /></div>
        <div><label style={lbl}>Поверенный (ФИО) *</label><input style={inp} value={form.grantee_fio} onChange={(e) => setForm({ ...form, grantee_fio: e.target.value })} /></div>
        <div><label style={lbl}>Должность</label><input style={inp} value={form.grantee_position} onChange={(e) => setForm({ ...form, grantee_position: e.target.value })} /></div>
        <div><label style={lbl}>Тип</label>
          <Select value={form.cert_type} className="ui-select--inp" onChange={(e) => setForm({ ...form, cert_type: e.target.value })}>
            {Object.entries(CERT_TYPE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div><label style={lbl}>Подписант</label><input style={inp} value={form.signer} onChange={(e) => setForm({ ...form, signer: e.target.value })} /></div>
        <div><label style={lbl}>Дата выдачи *</label><DatePicker value={form.issued_date} className="ui-select--inp" onChange={(e) => setForm({ ...form, issued_date: e.target.value })} /></div>
        <div><label style={lbl}>Действует до</label><DatePicker value={form.valid_to} className="ui-select--inp" onChange={(e) => setForm({ ...form, valid_to: e.target.value })} /></div>
      </div>
      <div>
        <label style={lbl}>Полномочия ({picked.length})</label>
        <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", padding: "10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
          {active.length === 0 ? (
            <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
              Нет активных полномочий в каталоге
            </span>
          ) : active.map((a) => (
            <Checkbox key={a.id} checked={picked.includes(a.id)} onChange={() => toggle(a.id)}
              label={`${a.code} · ${a.name_short}`} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Button size="s" onClick={submit} disabled={create.isPending}>{create.isPending ? "Создание…" : "Создать"}</Button>
        <Button size="s" variant="secondary" onClick={onDone}>Отмена</Button>
        {error && <span style={errText}>{error}</span>}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "", label: "Все" },
  { value: "active", label: "Действующие" },
  { value: "revoked", label: "Отозванные" },
  { value: "expired", label: "Истёкшие" },
];

export default function PoaRegistryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: certs = [], isLoading } = useRegistry({
    status: (status || undefined) as CertificateStatus | undefined,
    q: q || undefined,
  });

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Реестр</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <h1 style={{ flex: 1, fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Реестр доверенностей
        </h1>
        {canEdit && !showCreate && (
          <Button onClick={() => setShowCreate(true)} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>
            Добавить
          </Button>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <SegmentedControl segments={STATUS_TABS} value={status} onChange={setStatus} size="s" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по номеру или ФИО…" style={{ ...inp, maxWidth: "280px" }} />
      </div>

      {showCreate && canEdit && <CreateCert onDone={() => setShowCreate(false)} />}

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : certs.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          {q || status ? "Ничего не найдено" : "Доверенностей пока нет"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: showCreate ? "16px" : 0 }}>
          {certs.map((c) => <CertRow key={c.id} cert={c} canEdit={canEdit} />)}
        </div>
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
const meta: React.CSSProperties = {
  fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-secondary)",
};
const rowCard: React.CSSProperties = {
  background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)", padding: "14px 16px",
};
const createCard: React.CSSProperties = {
  padding: "20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1.5px solid var(--brand-blue)", display: "flex", flexDirection: "column", gap: "12px",
  marginBottom: "8px",
};
const errText: React.CSSProperties = {
  fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-accent-negative)",
};
