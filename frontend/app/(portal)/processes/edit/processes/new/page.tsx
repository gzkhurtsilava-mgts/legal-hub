"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import {
  useDomains,
  useRefList,
  useCreateProcess,
  useNextProcessId,
  type PmProcessType,
  type PmRole,
} from "@/lib/api/processes";

export default function NewProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [type, setType] = useState<PmProcessType>("workflow");
  const [domainId, setDomainId] = useState(searchParams.get("domain_id") ?? "");
  const [processId, setProcessId] = useState("");
  const [idManual, setIdManual] = useState(false);
  const [name, setName] = useState("");
  const [ownerRoleId, setOwnerRoleId] = useState<number | "">("");
  const [status, setStatus] = useState<"draft" | "as_is" | "to_be">("draft");
  const [error, setError] = useState<string | null>(null);

  const { data: domains } = useDomains();
  const { data: roles } = useRefList<PmRole>("roles");
  const createProcess = useCreateProcess();

  // Extract domain code for ID generation (e.g. "CONTRACT" from "LEG.CONTRACT")
  const domainCode = domainId ? domainId.replace(/^LEG\./, "").split(".")[0] : "";
  const { data: nextId } = useNextProcessId(domainCode, type, !!domainCode && !idManual);

  useEffect(() => {
    if (nextId && !idManual) setProcessId(nextId.suggested_id);
  }, [nextId, idManual]);

  // Reset suggested ID when domain/type changes (if not manually set)
  useEffect(() => {
    if (!idManual) setProcessId("");
  }, [domainId, type]);

  if (!session) return null;

  if (role && role !== "admin" && role !== "lawyer") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет прав доступа</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!domainId) { setError("Выберите домен"); return; }
    if (!processId.trim()) { setError("Укажите ID процесса"); return; }
    if (!name.trim()) { setError("Укажите название"); return; }
    try {
      const created = await createProcess.mutateAsync({
        id: processId.trim(),
        name: name.trim(),
        type,
        domain_id: domainId,
        owner_role_id: ownerRoleId !== "" ? Number(ownerRoleId) : null,
        status,
        version: "1.0",
      });
      router.push(`/processes/edit/processes/${created.id}`);
    } catch (err) {
      setError((err as Error)?.message ?? "Ошибка создания");
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "680px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>Карта процессов</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>Редактирование</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit/processes")} style={linkBtn}>Процессы</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Новый</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 28px" }}>
        Новый процесс
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Type selector */}
        <div style={card}>
          <label style={lbl}>Тип процесса <span style={req}>*</span></label>
          <div style={{ display: "flex", gap: "12px" }}>
            {(["workflow", "service"] as PmProcessType[]).map((t) => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  value={t}
                  checked={type === t}
                  onChange={() => { setType(t); setIdManual(false); }}
                  style={{ accentColor: "var(--brand-blue)" }}
                />
                <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)" }}>
                  {t === "workflow" ? "Процедура (Workflow)" : "Услуга (Service)"}
                </span>
              </label>
            ))}
          </div>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "8px", marginBottom: 0 }}>
            {type === "workflow"
              ? "Повторяющийся процесс с чётким потоком шагов, RACI и SLA"
              : "Экспертная задача без жёсткого потока, гибкий набор активностей"}
          </p>
        </div>

        {/* Domain + ID */}
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={lbl}>Домен <span style={req}>*</span></label>
              <select
                value={domainId}
                onChange={(e) => { setDomainId(e.target.value); setIdManual(false); }}
                required
                style={inp}
              >
                <option value="">— выберите —</option>
                {domains?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>
                ID процесса <span style={req}>*</span>
                {!idManual && nextId && (
                  <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: 400 }}>авто</span>
                )}
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  value={processId}
                  onChange={(e) => { setProcessId(e.target.value); setIdManual(true); }}
                  placeholder={domainId ? "Загрузка…" : "Сначала выберите домен"}
                  required
                  style={{ ...inp, fontFamily: "monospace", flex: 1 }}
                />
                {idManual && (
                  <button
                    type="button"
                    onClick={() => { setIdManual(false); if (nextId) setProcessId(nextId.suggested_id); }}
                    style={{ ...iconBtn, background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", padding: "0 8px" }}
                    title="Сбросить к автоматическому"
                  >
                    <Icon name="UpdateSize24StyleOutline" size={16} />
                  </button>
                )}
              </div>
              <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px", marginBottom: 0 }}>
                Формат: LEG.{domainCode || "ДОМЕН"}.{type === "workflow" ? "W" : "S"}.001
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={card}>
          <label style={lbl}>Название <span style={req}>*</span></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Краткое название процесса"
            required
            style={inp}
          />
        </div>

        {/* Owner + Status */}
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={lbl}>Ответственная роль</label>
              <select value={ownerRoleId} onChange={(e) => setOwnerRoleId(e.target.value === "" ? "" : Number(e.target.value))} style={inp}>
                <option value="">— не указана —</option>
                {roles?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={inp}>
                <option value="draft">Черновик</option>
                <option value="as_is">As-Is (текущий)</option>
                <option value="to_be">To-Be (целевой)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-negative)", margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={createProcess.isPending} style={primaryBtn}>
            {createProcess.isPending ? "Создание…" : <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Создать и перейти к редактированию<Icon name="ArrowRightSize24StyleOutline" size={14} /></span>}
          </button>
          <button type="button" onClick={() => router.push("/processes/edit/processes")} style={secondaryBtn}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)",
  padding: "16px 20px",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  marginBottom: "6px",
};
const req: React.CSSProperties = { color: "var(--color-accent-negative)" };
const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
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
  padding: "10px 24px",
  background: "var(--brand-blue)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};
const secondaryBtn: React.CSSProperties = {
  padding: "10px 18px",
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "14px",
  cursor: "pointer",
};
const iconBtn: React.CSSProperties = {
  padding: "4px 8px",
  background: "none",
  border: "none",
  fontFamily: "MTS Compact",
  fontSize: "14px",
  cursor: "pointer",
  color: "var(--brand-blue)",
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
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)" };
