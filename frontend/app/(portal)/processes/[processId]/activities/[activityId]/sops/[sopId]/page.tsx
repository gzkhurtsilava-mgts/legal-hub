"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useActivity,
  useProcess,
  useSop,
  type PmSopStep,
  type PmSopFaq,
} from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { LinkButton } from "@/components/ui";

// ─── Styles ────────────────────────────────────────────────────────────────────

const page: React.CSSProperties = {
  maxWidth: "800px",
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


// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SopViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const processId = params.processId as string;
  const activityId = params.activityId as string;
  const sopId = params.sopId as string;

  const { data: proc } = useProcess(processId);
  const { data: act } = useActivity(processId, activityId);
  const { data: sop, isLoading } = useSop(processId, activityId, sopId);

  const canEdit = session?.user?.role === "admin" || session?.user?.role === "lawyer";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!sop) {
    return (
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>СОП не найден</p>
        <LinkButton onClick={() => router.push(`/processes/${processId}/activities/${activityId}`)} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>Назад</LinkButton>
      </div>
    );
  }

  const steps = (sop.steps as PmSopStep[] | null) ?? [];
  const checklist = (sop.checklist as string[] | null) ?? [];
  const preconditions = (sop.preconditions as string[] | null) ?? [];
  const faq = (sop.faq as PmSopFaq[] | null) ?? [];
  const relatedDocs = (sop.related_docs as Array<{ title: string; ref: string }> | null) ?? [];
  const changelog = (sop.changelog as Array<{ date: string; author: string; note: string }> | null) ?? [];

  return (
    <div style={page}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push(`/processes/${processId}`)}>{proc?.name ?? processId}</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push(`/processes/${processId}/activities/${activityId}`)}>{act?.name ?? activityId}</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>{sop.title}</span>
      </div>

      {/* Header */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Стандартная операционная процедура
            </p>
            <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", margin: "0 0 6px" }}>{sop.title}</h1>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{sop.id}</span>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}/sops/${sopId}`)}
              style={{ padding: "6px 16px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Preconditions */}
      {preconditions.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Предусловия</h2>
          <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
            {preconditions.map((p, i) => (
              <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Порядок выполнения</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      {checklist.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Чеклист проверки</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {checklist.map((item, i) => (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "6px 0", cursor: "pointer" }}>
                <input type="checkbox" style={{ marginTop: "2px", accentColor: "var(--brand-blue)", width: "15px", height: "15px", flexShrink: 0 }} />
                <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)" }}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Часто задаваемые вопросы</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {faq.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Related docs */}
      {relatedDocs.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>Связанные документы</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {relatedDocs.map((doc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--color-background-lower)" }}>
                <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{doc.title}</span>
                {doc.ref && (
                  <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--brand-blue)" }}>{doc.ref}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changelog */}
      {changelog.length > 0 && (
        <div style={card}>
          <h2 style={sectionTitle}>История изменений</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {changelog.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "6px 0", borderBottom: "1px solid var(--color-background-lower)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>{c.date}</span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", flexShrink: 0 }}>{c.author}</span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{c.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step card ─────────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: PmSopStep; index: number }) {
  return (
    <div style={{ border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", overflow: "hidden" }}>
      {/* Step title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--color-background-secondary)" }}>
        <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--brand-blue)", width: "24px", flexShrink: 0 }}>{index}.</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>{step.title}</span>
      </div>

      {/* Substeps */}
      {(step.substeps ?? []).length > 0 && (
        <div style={{ padding: "10px 16px 0 52px" }}>
          {step.substeps.map((sub, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "var(--brand-blue)", fontWeight: 700, flexShrink: 0 }}>•</span>
              <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)" }}>{sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {(step.tips ?? []).length > 0 && (
        <div style={{ margin: "10px 16px", padding: "8px 12px", background: "var(--color-accent-positive-bg)", borderRadius: "var(--radius-s)", borderLeft: "3px solid var(--color-accent-positive)" }}>
          <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>
            <Icon name="InfoCircleSize24StyleOutline" size={15} style={{ color: "var(--color-accent-positive)", flexShrink: 0 }} />Советы
          </p>
          {step.tips.map((tip, i) => (
            <p key={i} style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-primary)", margin: i === step.tips.length - 1 ? 0 : "0 0 2px" }}>{tip}</p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {(step.warnings ?? []).length > 0 && (
        <div style={{ margin: "10px 16px", padding: "8px 12px", background: "var(--color-accent-negative-bg)", borderRadius: "var(--radius-s)", borderLeft: "3px solid var(--color-accent-negative)" }}>
          <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>
            <Icon name="WarningSize24StyleOutline" size={15} style={{ color: "var(--color-accent-negative)", flexShrink: 0 }} />Внимание
          </p>
          {step.warnings.map((w, i) => (
            <p key={i} style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-primary)", margin: i === step.warnings.length - 1 ? 0 : "0 0 2px" }}>{w}</p>
          ))}
        </div>
      )}

      {/* Spacing */}
      {((step.substeps ?? []).length > 0 || (step.tips ?? []).length > 0 || (step.warnings ?? []).length > 0) && (
        <div style={{ height: "10px" }} />
      )}
    </div>
  );
}

// ─── FAQ item (expandable) ─────────────────────────────────────────────────────

function FaqItem({ item }: { item: PmSopFaq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", overflow: "hidden", marginBottom: "4px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 16px", background: open ? "var(--color-background-secondary)" : "var(--color-background-primary)", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>
          {item.question}
        </span>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "16px", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "12px 16px 14px", borderTop: "1px solid var(--color-background-lower)" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", margin: 0, lineHeight: 1.6 }}>{item.answer}</p>
        </div>
      )}
    </div>
  );
}
