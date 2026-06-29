"use client";

import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useDomain, useProcesses, type PmProcessListItem, type PmStatus } from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { PageHeader, Button, LinkButton } from "@/components/ui";

const STATUS_LABELS: Record<PmStatus, string> = { draft: "Черновик", as_is: "As-Is", to_be: "To-Be" };
const STATUS_COLORS: Record<PmStatus, { bg: string; color: string }> = {
  draft: { bg: "#f5f5f5", color: "var(--color-text-tertiary)" },
  as_is: { bg: "#e8f5e9", color: "#2e7d32" },
  to_be: { bg: "#e8f0fe", color: "#1a73e8" },
};

function ProcessCard({ proc }: { proc: PmProcessListItem }) {
  const router = useRouter();
  const sc = STATUS_COLORS[proc.status] ?? STATUS_COLORS.draft;
  return (
    <div
      onClick={() => router.push(`/processes/${proc.id}`)}
      className="ui-hover-border"
      style={{ padding: "12px 16px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)", cursor: "pointer", marginBottom: "6px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{proc.name}</span>
        <span style={{ padding: "1px 6px", borderRadius: "var(--radius-s)", fontSize: "11px", fontFamily: "MTS Compact", fontWeight: 500, background: sc.bg, color: sc.color, flexShrink: 0 }}>
          {STATUS_LABELS[proc.status]}
        </span>
      </div>
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{proc.id}</span>
    </div>
  );
}

export default function DomainViewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: domain, isLoading, error } = useDomain(id);
  const { data: processes, isLoading: procLoading } = useProcesses({ domain_id: id });

  const workflows = (processes ?? []).filter((p) => p.type === "workflow");
  const services = (processes ?? []).filter((p) => p.type === "service");

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>
          Домен не найден
        </p>
        <LinkButton onClick={() => router.push("/processes")} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>Карта процессов</LinkButton>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <PageHeader
        crumbs={[
          { label: "Карта процессов", onClick: () => router.push("/processes") },
          { label: domain.name },
        ]}
        title={domain.name}
        titleSize={26}
        subtitle={`ID: ${domain.id}`}
        actions={
          <Button variant="secondary" size="m" onClick={() => router.push(`/processes/edit/domains/${domain.id}`)}>
            Редактировать
          </Button>
        }
      />

      {/* Description */}
      {domain.mission && (
        <div style={{ ...card, marginBottom: "16px" }}>
          <p style={sectionTitle}>Описание</p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>
            {domain.mission}
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.process_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Всего
          </p>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.workflow_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Процедур
          </p>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.service_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Услуг
          </p>
        </div>
      </div>

      {/* Process catalog */}
      {procLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner size={24} /></div>
      ) : (processes ?? []).length === 0 ? (
        <div style={{ ...card }}>
          <p style={sectionTitle}>Процессы и услуги</p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", margin: 0 }}>Процессы ещё не добавлены</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: workflows.length && services.length ? "1fr 1fr" : "1fr", gap: "16px" }}>
          {workflows.length > 0 && (
            <div style={{ ...card }}>
              <p style={sectionTitle}>Процедуры ({workflows.length})</p>
              {workflows.map((p) => <ProcessCard key={p.id} proc={p} />)}
            </div>
          )}
          {services.length > 0 && (
            <div style={{ ...card }}>
              <p style={sectionTitle}>Услуги ({services.length})</p>
              {services.map((p) => <ProcessCard key={p.id} proc={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)",
  padding: "16px 20px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "MTS Wide",
  fontWeight: 700,
  fontSize: "13px",
  color: "var(--color-text-secondary)",
  margin: "0 0 10px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

