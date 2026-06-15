"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useProcesses, useDomains, useDeleteProcess, type PmStatus, type PmProcessType } from "@/lib/api/processes";

const STATUS_LABELS: Record<PmStatus, string> = {
  draft: "Черновик",
  as_is: "As-Is",
  to_be: "To-Be",
};

const TYPE_LABELS: Record<PmProcessType, string> = {
  workflow: "Процедура",
  service: "Услуга",
};

const STATUS_COLORS: Record<PmStatus, string> = {
  draft: "var(--color-text-tertiary)",
  as_is: "var(--color-accent-positive)",
  to_be: "var(--brand-blue)",
};

export default function ProcessesListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [domainFilter, setDomainFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  const { data: domains } = useDomains();
  const { data: processes, isLoading } = useProcesses({
    domain_id: domainFilter || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    q: q || undefined,
  });

  const canEdit = role === "admin" || role === "lawyer";

  if (!session) return null;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>Карта процессов</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>Редактирование</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Процессы</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Все процессы
        </h1>
        {canEdit && (
          <button onClick={() => router.push("/processes/edit/processes/new")} style={primaryBtn}>
            + Добавить процесс
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          placeholder="Поиск по названию..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inp, width: "220px" }}
        />
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} style={{ ...inp, width: "200px" }}>
          <option value="">Все домены</option>
          {domains?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ ...inp, width: "160px" }}>
          <option value="">Все типы</option>
          <option value="workflow">Процедура</option>
          <option value="service">Услуга</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inp, width: "160px" }}>
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="as_is">As-Is</option>
          <option value="to_be">To-Be</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={44} />
        </div>
      ) : !processes?.length ? (
        <div style={emptyBox}>
          <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-tertiary)", margin: 0, textAlign: "center" }}>
            {q || domainFilter || typeFilter || statusFilter ? "Ничего не найдено" : "Процессов пока нет"}
          </p>
          {canEdit && !q && !domainFilter && !typeFilter && !statusFilter && (
            <button
              onClick={() => router.push("/processes/edit/processes/new")}
              style={{ ...primaryBtn, marginTop: "12px" }}
            >
              Добавить первый процесс
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {processes.map((p) => (
            <ProcessRow
              key={p.id}
              process={p}
              domainName={domains?.find((d) => d.id === p.domain_id)?.name}
              canEdit={canEdit}
              onEdit={() => router.push(`/processes/edit/processes/${p.id}`)}
            />
          ))}
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "8px" }}>
            Итого: {processes.length}
          </p>
        </div>
      )}
    </div>
  );
}

function ProcessRow({
  process,
  domainName,
  canEdit,
  onEdit,
}: {
  process: ReturnType<typeof useProcesses>["data"] extends (infer T)[] | undefined ? T : never;
  domainName?: string;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const del = useDeleteProcess(process.id);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    try {
      await del.mutateAsync();
    } catch (err) {
      alert((err as Error)?.message ?? "Ошибка удаления");
      setConfirming(false);
    }
  };

  return (
    <div style={rowCard}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: 0 }}>
        {/* Type badge */}
        <span style={{
          padding: "2px 8px",
          borderRadius: "var(--radius-s)",
          fontSize: "11px",
          fontFamily: "MTS Compact",
          fontWeight: 500,
          whiteSpace: "nowrap",
          background: process.type === "workflow" ? "#e8f4fd" : "#f0f8ee",
          color: process.type === "workflow" ? "var(--brand-blue)" : "var(--color-accent-positive)",
          border: `1px solid ${process.type === "workflow" ? "#b3d9f7" : "#b8e6b0"}`,
          flexShrink: 0,
          marginTop: "2px",
        }}>
          {TYPE_LABELS[process.type]}
        </span>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "MTS Compact", fontWeight: 500, fontSize: "14px", color: "var(--color-text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {process.name}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
            {process.id}
            {domainName && ` · ${domainName}`}
            {` · v${process.version}`}
          </p>
        </div>
      </div>

      {/* Status + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: STATUS_COLORS[process.status] }}>
          {STATUS_LABELS[process.status]}
        </span>
        {canEdit && (
          <>
            <button onClick={onEdit} style={iconBtn}>Изм.</button>
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              style={{ ...iconBtn, color: confirming ? "var(--color-accent-negative)" : "var(--color-text-tertiary)" }}
            >
              {confirming ? "Удалить?" : "✕"}
            </button>
            {confirming && (
              <button onClick={() => setConfirming(false)} style={{ ...iconBtn, color: "var(--color-text-tertiary)" }}>
                Отмена
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const rowCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  padding: "12px 16px",
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)",
};

const emptyBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 24px",
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px dashed var(--color-background-lower)",
};

const inp: React.CSSProperties = {
  padding: "8px 10px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-text-primary)",
  background: "var(--color-background-secondary)",
  border: "1px solid var(--color-background-lower)",
  borderRadius: "var(--radius-m)",
  outline: "none",
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

const iconBtn: React.CSSProperties = {
  padding: "4px 8px",
  background: "none",
  border: "none",
  borderRadius: "var(--radius-s)",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  color: "var(--brand-blue)",
  cursor: "pointer",
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
