"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useDomain, useUpdateDomain, useProcesses, type PmDomainUpdate } from "@/lib/api/processes";

export default function EditDomainPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const { data: domain, isLoading } = useDomain(id);
  const update = useUpdateDomain(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!domain) return;
    setName(domain.name);
    setDescription(domain.mission ?? "");
  }, [domain]);

  if (!session) return null;

  if (role && role !== "admin" && role !== "lawyer") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет прав доступа</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!domain) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>Домен не найден</p>
        <button onClick={() => router.push("/processes/edit/domains")} style={linkBtn}>← Все домены</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const body: PmDomainUpdate = {
      name: name.trim(),
      mission: description.trim() || null,
    };
    try {
      await update.mutateAsync(body);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error)?.message ?? "Ошибка сохранения");
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>Карта процессов</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>Редактирование</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit/domains")} style={linkBtn}>Домены</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>{domain.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            {domain.name}
          </h1>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
            {domain.id}
            {domain.process_count > 0 && ` · ${domain.workflow_count} процедур · ${domain.service_count} услуг`}
          </p>
        </div>
        <button onClick={() => router.push(`/processes/domains/${domain.id}`)} style={secondaryBtn}>
          Просмотр →
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>ID</label>
              <input
                value={domain.id}
                disabled
                style={{ ...inp, opacity: 0.5, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em", cursor: "not-allowed" }}
              />
            </div>
            <div>
              <label style={lbl}>Название <span style={{ color: "var(--color-accent-negative)" }}>*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} required style={inp} />
            </div>
          </div>
        </div>

        <div style={card}>
          <label style={lbl}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание домена — чем занимается, какие задачи решает"
            rows={3}
            style={{ ...inp, resize: "vertical" }}
          />
        </div>

        {error && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-negative)", margin: 0 }}>
            {error}
          </p>
        )}
        {saved && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-positive)", margin: 0 }}>
            Сохранено
          </p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={update.isPending} style={primaryBtn}>
            {update.isPending ? "Сохранение…" : "Сохранить"}
          </button>
          <button type="button" onClick={() => router.push("/processes/edit/domains")} style={secondaryBtn}>
            К списку доменов
          </button>
        </div>
      </form>

      <DomainProcesses domainId={domain.id} role={role} />
    </div>
  );
}

function DomainProcesses({ domainId, role }: { domainId: string; role?: string }) {
  const router = useRouter();
  const { data: processes, isLoading } = useProcesses({ domain_id: domainId });
  const canEdit = role === "admin" || role === "lawyer";

  const TYPE_LABELS: Record<string, string> = { workflow: "Процедура", service: "Услуга" };
  const STATUS_LABELS: Record<string, string> = { draft: "Черновик", as_is: "As-Is", to_be: "To-Be" };

  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary)", margin: 0 }}>
          Процессы домена
        </h2>
        {canEdit && (
          <button
            onClick={() => router.push(`/processes/edit/processes/new?domain_id=${domainId}`)}
            style={primaryBtn}
          >
            + Добавить процесс
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}><Spinner size={24} /></div>
      ) : !processes?.length ? (
        <div style={{ padding: "24px 20px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1px dashed var(--color-background-lower)", textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-tertiary)", margin: 0 }}>
            Процессов в домене нет
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {processes.map((p) => (
            <div
              key={p.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span style={{
                  padding: "2px 7px",
                  borderRadius: "var(--radius-s)",
                  fontSize: "11px",
                  fontFamily: "MTS Compact",
                  fontWeight: 500,
                  background: p.type === "workflow" ? "#e8f4fd" : "#f0f8ee",
                  color: p.type === "workflow" ? "var(--brand-blue)" : "var(--color-accent-positive)",
                  border: `1px solid ${p.type === "workflow" ? "#b3d9f7" : "#b8e6b0"}`,
                  flexShrink: 0,
                }}>
                  {TYPE_LABELS[p.type]}
                </span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>{p.id}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{STATUS_LABELS[p.status]}</span>
                {canEdit && (
                  <button
                    onClick={() => router.push(`/processes/edit/processes/${p.id}`)}
                    style={linkBtn}
                  >
                    Изм. →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = { background: "var(--color-background-primary)", borderRadius: "1var(--radius-m)", border: "1px solid var(--color-background-lower)", padding: "16px 20px" };
const lbl: React.CSSProperties = { display: "block", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" };
const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
const primaryBtn: React.CSSProperties = { padding: "10px 24px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "10px 18px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", cursor: "pointer" };
const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)" };
