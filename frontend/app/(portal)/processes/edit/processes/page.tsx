"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useProcesses, useDomains, useDeleteProcess, type PmStatus, type PmProcessType } from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { Button, LinkButton, IconButton, Select, Badge } from "@/components/ui";

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
        <LinkButton onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
        <span style={sep}>›</span>
        <LinkButton onClick={() => router.push("/processes/edit")}>Редактирование</LinkButton>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Процессы</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Все процессы
        </h1>
        {canEdit && (
          <Button onClick={() => router.push("/processes/edit/processes/new")} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>
            Добавить процесс
          </Button>
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
        <Select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="ui-select--inp" style={{ width: "200px" }}>
          <option value="">Все домены</option>
          {domains?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="ui-select--inp" style={{ width: "160px" }}>
          <option value="">Все типы</option>
          <option value="workflow">Процедура</option>
          <option value="service">Услуга</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ui-select--inp" style={{ width: "160px" }}>
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="as_is">As-Is</option>
          <option value="to_be">To-Be</option>
        </Select>
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
            <Button
              onClick={() => router.push("/processes/edit/processes/new")}
              style={{ marginTop: "12px" }}
            >
              Добавить первый процесс
            </Button>
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
        <Badge tone={process.type === "workflow" ? "brand" : "positive"} style={{ flexShrink: 0, marginTop: "2px" }}>
          {TYPE_LABELS[process.type]}
        </Badge>

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
            <LinkButton onClick={onEdit} style={{ fontSize: "13px" }}>Изм.</LinkButton>
            {!confirming ? (
              <IconButton size={28} danger onClick={handleDelete} label="Удалить">
                <Icon name="CrossSize16StyleOutline" size={14} />
              </IconButton>
            ) : (
              <>
                <Button size="xs" variant="negative" onClick={handleDelete} disabled={del.isPending}>Удалить?</Button>
                <Button size="xs" variant="secondary" onClick={() => setConfirming(false)}>Отмена</Button>
              </>
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

const sep: React.CSSProperties = { color: "var(--color-text-tertiary)" };
