"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useProcess,
  useActivity,
  useSops,
  type PmDataOperation,
  type PmDecisionBranch,
} from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { LinkButton } from "@/components/ui";

// ─── Styles ────────────────────────────────────────────────────────────────────

const page: React.CSSProperties = {
  maxWidth: "820px",
  margin: "0 auto",
  padding: "24px 20px 64px",
};

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-l)",
  padding: "24px",
  marginBottom: "16px",
  boxShadow: "var(--shadow-low)",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "MTS Wide",
  fontWeight: 700,
  fontSize: "15px",
  color: "var(--color-text-primary)",
  margin: "0 0 14px",
};

const tag: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "var(--radius-s)",
  fontSize: "12px",
  fontFamily: "MTS Compact",
  fontWeight: 500,
};


const metaLabel: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "11px",
  color: "var(--color-text-tertiary)",
  margin: "0 0 2px",
};

const metaValue: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-text-primary)",
  margin: 0,
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ActivityViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const processId = params.processId as string;
  const activityId = params.activityId as string;

  const { data: proc } = useProcess(processId);
  const { data: act, isLoading } = useActivity(processId, activityId);
  const { data: sops, isLoading: sopsLoading } = useSops(processId, activityId);

  const isWorkflow = proc?.type === "workflow";
  const canEdit = session?.user?.role === "admin" || session?.user?.role === "lawyer";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!act) {
    return (
      <div style={{ padding: "40px", maxWidth: "820px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>Активность не найдена</p>
        <LinkButton onClick={() => router.push(`/processes/${processId}`)} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>Назад</LinkButton>
      </div>
    );
  }

  const ACT_TYPE_MAP: Record<string, { label: string; bg: string; color: string }> = {
    manual: { label: "Ручная", bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
    system: { label: "Системная", bg: "var(--color-accent-brand-bg)", color: "var(--color-text-brand)" },
    decision: { label: "Решение / Ветвление", bg: "var(--color-accent-warning-bg)", color: "var(--color-text-primary)" },
  };
  const typeStyle = act.activity_type ? (ACT_TYPE_MAP[act.activity_type] ?? ACT_TYPE_MAP.manual) : null;

  const dataOps = (act.data_operations as PmDataOperation[] | null) ?? [];
  const decisionLogic = (act.decision_logic as PmDecisionBranch[] | null) ?? [];
  const qualityCriteria = (act.quality_criteria as string[] | null) ?? [];

  return (
    <div style={page}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push(`/processes/${processId}`)}>{proc?.name ?? processId}</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>{act.name}</span>
      </div>

      {/* Header card */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", margin: "0 0 8px" }}>{act.name}</h1>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              {isWorkflow && typeStyle && (
                <span style={{ ...tag, background: typeStyle.bg, color: typeStyle.color }}>{typeStyle.label}</span>
              )}
              {!isWorkflow && (
                <span style={{ ...tag, background: act.is_optional ? "#fff8e8" : "#edf8ed", color: act.is_optional ? "#b8860b" : "var(--color-accent-positive)" }}>
                  {act.is_optional ? "Опциональная" : "Обязательная"}
                </span>
              )}
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{act.id}</span>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}`)}
              style={{ padding: "6px 16px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer" }}
            >
              Редактировать
            </button>
          )}
        </div>

        {act.description && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", lineHeight: 1.6, margin: "0 0 16px" }}>
            {act.description}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {act.condition_note && (
            <div style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", flex: "1 1 200px" }}>
              <p style={metaLabel}>Условие выполнения</p>
              <p style={metaValue}>{act.condition_note}</p>
            </div>
          )}
          {act.duration && (
            <div style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
              <p style={metaLabel}>Продолжительность</p>
              <p style={metaValue}>{act.duration}</p>
            </div>
          )}
          {act.automation_potential != null && (
            <div style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
              <p style={metaLabel}>Потенциал автоматизации</p>
              <p style={{ ...metaValue, color: "var(--brand-blue)" }}>{act.automation_potential}%</p>
            </div>
          )}
          {!isWorkflow && act.phase_number != null && (
            <div style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
              <p style={metaLabel}>Номер фазы</p>
              <p style={metaValue}>{act.phase_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Data operations (workflow) */}
      {isWorkflow && dataOps.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Операции с данными</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {dataOps.map((op, i) => {
              const isRead = op.operation === "read";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                  <span style={{ ...tag, background: isRead ? "#e8f0fe" : "#edf8ed", color: isRead ? "#1a73e8" : "#2e7d32", fontSize: "11px", flexShrink: 0 }}>
                    {isRead ? "Чтение" : "Создание"}
                  </span>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{op.data}</span>
                  {op.source_target && (
                    <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{op.source_target}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision logic (workflow + decision type) */}
      {isWorkflow && act.activity_type === "decision" && decisionLogic.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Ветви решения</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {decisionLogic.map((d, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 8px" }}>
                  <Icon name="QuestionCircleSize24StyleOutline" size={16} style={{ color: "var(--color-icons-secondary)", flexShrink: 0 }} />
                  {d.question}
                </p>
                <div style={{ display: "flex", gap: "16px" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-positive)", margin: 0 }}>
                    <Icon name="CheckCircleSize24StyleOutline" size={16} style={{ flexShrink: 0 }} />Да: {d.branch_yes || "—"}
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-negative)", margin: 0 }}>
                    <Icon name="CrossCircleSize24StyleOutline" size={16} style={{ flexShrink: 0 }} />Нет: {d.branch_no || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality criteria (service) */}
      {!isWorkflow && qualityCriteria.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Критерии качества</h2>
          <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
            {qualityCriteria.map((c, i) => (
              <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SOPs */}
      <div style={card}>
        <h2 style={sectionTitle}>СОПы — стандартные операционные процедуры</h2>
        {sopsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}><Spinner size={24} /></div>
        ) : !sops || sops.length === 0 ? (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0 }}>СОПы не добавлены</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {sops.map((sop) => (
              <div
                key={sop.id}
                onClick={() => router.push(`/processes/${processId}/activities/${activityId}/sops/${sop.id}`)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", cursor: "pointer", border: "1px solid transparent" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-blue)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")}
              >
                <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", flex: 1 }}>{sop.title}</span>
                {(sop.steps ?? []).length > 0 && (
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    {sop.steps!.length} шаг{sop.steps!.length === 1 ? "" : sop.steps!.length < 5 ? "а" : "ов"}
                  </span>
                )}
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{sop.id}</span>
                <span style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
