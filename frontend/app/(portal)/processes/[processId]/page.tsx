"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useProcess,
  useActivities,
  useDomain,
  type PmProcessDetail,
  type PmStatus,
  type PmSirporc,
  type PmRaciRowOut,
  type PmImpact,
  type PmMetricStatus,
} from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { LinkButton } from "@/components/ui";

// ─── Styles ────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<PmStatus, string> = { draft: "Черновик", as_is: "As-Is", to_be: "To-Be" };
const STATUS_COLORS: Record<PmStatus, { bg: string; color: string }> = {
  draft: { bg: "#f5f5f5", color: "var(--color-text-tertiary)" },
  as_is: { bg: "#e8f5e9", color: "#2e7d32" },
  to_be: { bg: "#e8f0fe", color: "#1a73e8" },
};
const IMPACT_LABELS: Record<PmImpact, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };
const IMPACT_COLORS: Record<PmImpact, string> = {
  high: "var(--color-accent-negative)",
  medium: "var(--color-accent-warning)",
  low: "var(--color-accent-positive)",
};
const METRIC_STATUS_LABELS: Record<PmMetricStatus, string> = { fact: "Факт", estimate: "Оценка", no_data: "Нет данных" };

const layout: React.CSSProperties = {
  maxWidth: "1040px",
  margin: "0 auto",
  padding: "24px 20px 64px",
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "24px",
  alignItems: "start",
};

const sidebarStyle: React.CSSProperties = {
  position: "sticky",
  top: "80px",
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
  margin: "0 0 16px",
};

const sectionHint: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "12px",
  color: "var(--color-text-tertiary)",
  margin: "-10px 0 16px",
};

const tag: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "var(--radius-s)",
  fontSize: "12px",
  fontFamily: "MTS Compact",
  fontWeight: 500,
};

const tocItem: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  color: "var(--color-text-secondary)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "5px 8px",
  borderRadius: "var(--radius-s)",
  marginBottom: "2px",
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ProcessViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const processId = params.processId as string;

  const { data: proc, isLoading } = useProcess(processId);
  const { data: activities, isLoading: activitiesLoading } = useActivities(processId);
  const { data: domain } = useDomain(proc?.domain_id ?? "", );

  const canEdit = session?.user?.role === "admin" || session?.user?.role === "lawyer";
  const isWorkflow = proc?.type === "workflow";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!proc) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "860px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>Процесс не найден</p>
        <LinkButton onClick={() => router.push("/processes")} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>Карта процессов</LinkButton>
      </div>
    );
  }

  const sections = isWorkflow
    ? ["overview", "sirporc", "activities", "raci", "metrics", "risks", "regulations", "bu", "systems", "pain", "automation", "connections", "changelog"]
    : ["overview", "sirporc", "activities", "competencies", "effort", "decision-points", "case-library", "risks", "regulations", "bu", "systems", "improvement", "connections", "changelog"];

  const SECTION_LABELS: Record<string, string> = {
    overview: "Обзор",
    sirporc: "SIRPORC",
    activities: `Активности (${proc.activity_count})`,
    raci: "RACI",
    metrics: "Метрики",
    risks: "Риски",
    regulations: "Нормативка",
    bu: "Бизнес-юниты",
    systems: "Системы",
    pain: "Боли / SLA",
    automation: "Автоматизация",
    connections: "Связи",
    changelog: "Changelog",
    competencies: "Компетенции",
    effort: "Трудозатраты",
    "decision-points": "Точки решений",
    "case-library": "Прецеденты",
    improvement: "Улучшения",
  };

  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sc = STATUS_COLORS[proc.status] ?? STATUS_COLORS.draft;

  return (
    <div>
      {/* Top breadcrumb + edit button — full width above grid */}
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
            <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
            <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push(`/processes/domains/${proc.domain_id}`)}>
              {domain?.name ?? proc.domain_id}
            </LinkButton>
            <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
            <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>{proc.name}</span>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push(`/processes/edit/processes/${processId}`)}
              style={{ padding: "6px 16px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div style={layout}>
        {/* Sidebar ToC */}
        <aside style={sidebarStyle}>
          {sections.map((s) => (
            <button key={s} onClick={() => scrollTo(s)} style={tocItem} onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background-lower)")} onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}>
              {SECTION_LABELS[s] ?? s}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main>
          {/* Overview */}
          <div id="section-overview" style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
              <div>
                <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", margin: "0 0 8px" }}>{proc.name}</h1>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...tag, background: sc.bg, color: sc.color }}>{STATUS_LABELS[proc.status]}</span>
                  <span style={{ ...tag, background: isWorkflow ? "#e8f5e9" : "#e8f0fe", color: isWorkflow ? "#2e7d32" : "#1a73e8" }}>
                    {isWorkflow ? "Процедура (Workflow)" : "Услуга (Service)"}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{proc.id}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <MetaCell label="Версия" value={proc.version || "1.0"} />
              <MetaCell label="Обновлён" value={proc.last_updated ? formatDate(proc.last_updated) : "—"} />
              <MetaCell label="Следующий пересмотр" value={proc.next_review ? formatDate(proc.next_review) : "—"} />
              {isWorkflow && proc.sla_days != null && (
                <MetaCell label="SLA" value={`${proc.sla_days} дн.`} />
              )}
              {proc.lifecycle_ref_id && (
                <MetaCell label="Связанная версия" value={proc.lifecycle_ref_id} />
              )}
            </div>
          </div>

          {/* SIRPORC */}
          <SirporcSection id="section-sirporc" sirporc={proc.sirporc} />

          {/* Activities */}
          <div id="section-activities" style={card}>
            <h2 style={sectionTitle}>{isWorkflow ? "Активности" : "Фазы выполнения"}</h2>
            {activitiesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}><Spinner size={24} /></div>
            ) : !activities || activities.length === 0 ? (
              <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)" }}>Активности не описаны</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {activities.map((act, idx) => (
                  <div
                    key={act.id}
                    onClick={() => router.push(`/processes/${processId}/activities/${act.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", cursor: "pointer", border: "1px solid transparent" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-blue)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")}
                  >
                    <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "13px", color: "var(--brand-blue)", width: "22px", flexShrink: 0 }}>{idx + 1}.</span>
                    {isWorkflow && act.activity_type && (
                      <ActivityTypeBadge type={act.activity_type} />
                    )}
                    {!isWorkflow && (
                      <span style={{ ...tag, background: act.is_optional ? "#fff8e8" : "#edf8ed", color: act.is_optional ? "#b8860b" : "var(--color-accent-positive)", fontSize: "10px" }}>
                        {act.is_optional ? "Опц." : "Обяз."}
                      </span>
                    )}
                    <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", flex: 1 }}>{act.name}</span>
                    {act.duration && <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{act.duration}</span>}
                    <span style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RACI (workflow only) */}
          {isWorkflow && proc.raci.length > 0 && (
            <div id="section-raci" style={card}>
              <h2 style={sectionTitle}>RACI — матрица ответственности</h2>
              <RaciTable raci={proc.raci} />
            </div>
          )}

          {/* Metrics (workflow only) */}
          {isWorkflow && proc.metrics.length > 0 && (
            <div id="section-metrics" style={card}>
              <h2 style={sectionTitle}>Метрики</h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {proc.metrics.map((m) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{m.name}</span>
                    {m.value && <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--brand-blue)" }}>{m.value}{m.unit ? ` ${m.unit}` : ""}</span>}
                    <span style={{ ...tag, background: "var(--color-background-lower)", color: "var(--color-text-secondary)", fontSize: "11px" }}>{METRIC_STATUS_LABELS[m.metric_status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {proc.risks.length > 0 && (
            <div id="section-risks" style={card}>
              <h2 style={sectionTitle}>Риски</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "MTS Compact", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-background-lower)" }}>
                    <th style={th}>Риск</th>
                    <th style={th}>Влияние</th>
                    <th style={th}>Вероятность</th>
                    <th style={th}>Контроль</th>
                  </tr>
                </thead>
                <tbody>
                  {proc.risks.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--color-background-lower)" }}>
                      <td style={td}>{r.risk_name}</td>
                      <td style={td}>
                        {r.impact ? <span style={{ color: IMPACT_COLORS[r.impact] }}>{IMPACT_LABELS[r.impact]}</span> : "—"}
                      </td>
                      <td style={td}>
                        {r.probability ? <span style={{ color: IMPACT_COLORS[r.probability] }}>{IMPACT_LABELS[r.probability]}</span> : "—"}
                      </td>
                      <td style={td}>{r.control || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Regulations */}
          {proc.regulations.length > 0 && (
            <div id="section-regulations" style={card}>
              <h2 style={sectionTitle}>Нормативная база</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {proc.regulations.map((r, i) => (
                  <div key={i} style={{ padding: "8px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{r.reg_name}</span>
                      {r.articles && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{r.articles}</span>}
                    </div>
                    {r.relevance_note && <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{r.relevance_note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Units */}
          {proc.business_units.length > 0 && (
            <div id="section-bu" style={card}>
              <h2 style={sectionTitle}>Бизнес-юниты</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {proc.business_units.map((b, i) => (
                  <span key={i} style={{ ...tag, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "1px solid var(--color-background-lower)" }}>
                    {b.bu_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Systems */}
          {proc.systems.length > 0 && (
            <div id="section-systems" style={card}>
              <h2 style={sectionTitle}>Используемые системы</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {proc.systems.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "6px 0", borderBottom: "1px solid var(--color-background-lower)" }}>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)" }}>{s.system_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain points + SLA (workflow only) */}
          {isWorkflow && (proc.pain_points ?? []).length > 0 && (
            <div id="section-pain" style={card}>
              <h2 style={sectionTitle}>Проблемные точки</h2>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {(proc.pain_points ?? []).map((p, i) => (
                  <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Automation candidates (workflow only) */}
          {isWorkflow && proc.automation_candidates.length > 0 && (
            <div id="section-automation" style={card}>
              <h2 style={sectionTitle}>Кандидаты на автоматизацию</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {proc.automation_candidates.map((a) => (
                  <div key={a.id} style={{ padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <p style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>{a.idea}</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {a.impact && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-secondary)" }}>Эффект: {a.impact}</span>}
                      {a.effort && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-secondary)" }}>Усилие: {a.effort}</span>}
                      {a.score != null && <span style={{ fontFamily: "MTS Wide", fontSize: "11px", fontWeight: 700, color: "var(--brand-blue)" }}>Score: {a.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competencies (service only) */}
          {!isWorkflow && (proc.required_competencies ?? []).length > 0 && (
            <div id="section-competencies" style={card}>
              <h2 style={sectionTitle}>Требуемые компетенции</h2>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {(proc.required_competencies ?? []).map((c, i) => (
                  <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", marginBottom: "4px" }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Effort estimation (service only) */}
          {!isWorkflow && proc.effort_estimation && (
            <div id="section-effort" style={card}>
              <h2 style={sectionTitle}>Оценка трудозатрат</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
                <MetaCell label="Простой" value={proc.effort_estimation.simple || "—"} />
                <MetaCell label="Средний" value={proc.effort_estimation.medium || "—"} />
                <MetaCell label="Сложный" value={proc.effort_estimation.complex || "—"} />
              </div>
              {(proc.effort_estimation.factors ?? []).length > 0 && (
                <>
                  <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Факторы:</p>
                  <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                    {proc.effort_estimation.factors.map((f: string, i: number) => (
                      <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "13px", marginBottom: "2px" }}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Decision points (service only) */}
          {!isWorkflow && (proc.decision_points ?? []).length > 0 && (
            <div id="section-decision-points" style={card}>
              <h2 style={sectionTitle}>Точки принятия решений</h2>
              {(proc.decision_points ?? []).map((dp: { decision: string; factors: string[] }, i: number) => (
                <div key={i} style={{ marginBottom: "12px", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
                    <Icon name="QuestionCircleSize24StyleOutline" size={16} style={{ color: "var(--color-icons-secondary)", flexShrink: 0 }} />{dp.decision}
                  </p>
                  {(dp.factors ?? []).length > 0 && (
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {dp.factors.map((f: string, j: number) => <li key={j} style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)" }}>{f}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Case library (service only) */}
          {!isWorkflow && (proc.case_library ?? []).length > 0 && (
            <div id="section-case-library" style={card}>
              <h2 style={sectionTitle}>Библиотека прецедентов</h2>
              {(proc.case_library ?? []).map((c: { case_id: string; title: string; year: number | null; effort: string; author: string; lessons: string[] }, i: number) => (
                <div key={i} style={{ marginBottom: "12px", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", flex: 1 }}>{c.title}</span>
                    {c.year && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{c.year}</span>}
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{c.case_id}</span>
                  </div>
                  {c.effort && <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: "0 0 4px" }}>Трудозатраты: {c.effort}</p>}
                  {(c.lessons ?? []).length > 0 && (
                    <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                      {c.lessons.map((l: string, j: number) => <li key={j} style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)" }}>{l}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Improvement candidates (service only) */}
          {!isWorkflow && (proc.improvement_candidates ?? []).length > 0 && (
            <div id="section-improvement" style={card}>
              <h2 style={sectionTitle}>Кандидаты на улучшение</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(proc.improvement_candidates ?? []).map((a: { idea: string; type: string; impact: string; effort: string; score: number }, i: number) => (
                  <div key={i} style={{ padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <p style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, margin: "0 0 4px" }}>{a.idea}</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {a.type && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-secondary)" }}>Тип: {a.type}</span>}
                      {a.impact && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-secondary)" }}>Эффект: {a.impact}</span>}
                      {a.effort && <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-secondary)" }}>Усилие: {a.effort}</span>}
                      {a.score != null && <span style={{ fontFamily: "MTS Wide", fontSize: "11px", fontWeight: 700, color: "var(--brand-blue)" }}>Score: {a.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connections */}
          {(proc.connections ?? []).length > 0 && (
            <div id="section-connections" style={card}>
              <h2 style={sectionTitle}>Связи с процессами</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(proc.connections ?? []).map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                    <span style={{ ...tag, display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--color-background-lower)", color: "var(--color-text-secondary)", fontSize: "11px" }}>
                      <Icon
                        name={c.direction === "up" ? "ArrowUpSize24StyleOutline" : c.direction === "down" ? "ArrowDownSize24StyleOutline" : "SwapSize24StyleOutline"}
                        size={13}
                        style={{ flexShrink: 0 }}
                      />
                      {c.direction === "up" ? "Вышестоящий" : c.direction === "down" ? "Нижестоящий" : "Смежный"}
                    </span>
                    <LinkButton style={{ fontSize: "13px" }} onClick={() => router.push(`/processes/${c.target_process_id}`)}>{c.target_process_id}</LinkButton>
                    {c.note && <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", flex: 1 }}>{c.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog */}
          {(proc.changelog ?? []).length > 0 && (
            <div id="section-changelog" style={card}>
              <h2 style={sectionTitle}>История изменений</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(proc.changelog ?? []).map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "1px solid var(--color-background-lower)" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>{c.date}</span>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", flexShrink: 0 }}>{c.author}</span>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{c.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── SIRPORC table ─────────────────────────────────────────────────────────────

function SirporcSection({ id, sirporc }: { id: string; sirporc: PmSirporc | null }) {
  if (!sirporc) return null;

  const isEmpty = !sirporc.suppliers?.length && !sirporc.inputs?.length && !sirporc.outputs?.length && !sirporc.clients?.length && !sirporc.process_summary;
  if (isEmpty) return null;

  const columns: { key: keyof PmSirporc; label: string; isRequirements: boolean }[] = [
    { key: "suppliers", label: "S — Поставщики", isRequirements: false },
    { key: "inputs", label: "I — Входы", isRequirements: false },
    { key: "input_requirements", label: "R — Требования к входам", isRequirements: true },
    { key: "process_summary", label: "P — Процесс", isRequirements: false },
    { key: "outputs", label: "O — Выходы", isRequirements: false },
    { key: "output_requirements", label: "R — Требования к выходам", isRequirements: true },
    { key: "clients", label: "C — Клиенты", isRequirements: false },
  ];

  return (
    <div id={id} style={{ ...card, overflowX: "auto" }}>
      <h2 style={sectionTitle}>SIRPORC</h2>
      <p style={sectionHint}>Поставщики · Входы · Требования к входам · Процесс · Выходы · Требования к выходам · Клиенты</p>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                ...th,
                background: col.isRequirements ? "#fff8e8" : "var(--color-background-secondary)",
                fontWeight: col.isRequirements ? 700 : 500,
                color: col.isRequirements ? "#b8860b" : "var(--color-text-secondary)",
                width: col.key === "process_summary" ? "18%" : "12%",
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((col) => {
              const val = sirporc[col.key];
              return (
                <td key={col.key} style={{
                  ...td,
                  verticalAlign: "top",
                  background: col.isRequirements ? "#fffcf2" : "transparent",
                }}>
                  {Array.isArray(val) ? (
                    val.length === 0 ? <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>—</span> : (
                      <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                        {val.map((item: string, i: number) => (
                          <li key={i} style={{ fontFamily: "MTS Compact", fontSize: "12px", marginBottom: "3px" }}>{item}</li>
                        ))}
                      </ul>
                    )
                  ) : val ? (
                    <p style={{ fontFamily: "MTS Compact", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>{val as string}</p>
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>—</span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── RACI table ────────────────────────────────────────────────────────────────

function RaciTable({ raci }: { raci: PmRaciRowOut[] }) {
  // Group by role
  const byRole = new Map<string, { role_name: string; rows: PmRaciRowOut[] }>();
  for (const row of raci) {
    const key = String(row.role_id);
    if (!byRole.has(key)) byRole.set(key, { role_name: row.role_name, rows: [] });
    byRole.get(key)!.rows.push(row);
  }

  const roles = Array.from(byRole.values());

  const raciDot = (active: boolean, letter: string, color: string) =>
    active ? <span style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "14px", color }}>{letter}</span> : null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "MTS Compact", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--color-background-lower)" }}>
            <th style={{ ...th, textAlign: "left" }}>Роль</th>
            <th style={{ ...th, textAlign: "center", width: "60px" }}>R</th>
            <th style={{ ...th, textAlign: "center", width: "60px" }}>A</th>
            <th style={{ ...th, textAlign: "center", width: "60px" }}>C</th>
            <th style={{ ...th, textAlign: "center", width: "60px" }}>I</th>
            <th style={{ ...th, textAlign: "left" }}>Активность</th>
          </tr>
        </thead>
        <tbody>
          {roles.flatMap(({ role_name, rows }) =>
            rows.map((row, i) => (
              <tr key={`${role_name}-${i}`} style={{ borderBottom: "1px solid var(--color-background-lower)" }}>
                <td style={td}>{i === 0 ? role_name : ""}</td>
                <td style={{ ...td, textAlign: "center" }}>{raciDot(row.r, "R", "var(--color-accent-negative)")}</td>
                <td style={{ ...td, textAlign: "center" }}>{raciDot(row.a, "A", "#b8860b")}</td>
                <td style={{ ...td, textAlign: "center" }}>{raciDot(row.c, "C", "#1a73e8")}</td>
                <td style={{ ...td, textAlign: "center" }}>{raciDot(row.i, "I", "var(--color-accent-positive)")}</td>
                <td style={{ ...td, color: "var(--color-text-secondary)" }}>{row.activity_id || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "8px" }}>
        R — Исполнитель · A — Ответственный · C — Согласующий · I — Информируемый
      </p>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
      <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>{value}</p>
    </div>
  );
}

function ActivityTypeBadge({ type }: { type: string }) {
  const MAP: Record<string, { label: string; bg: string; color: string }> = {
    manual: { label: "Ручная", bg: "#f5f5f5", color: "var(--color-text-secondary)" },
    system: { label: "Системная", bg: "#e8f0fe", color: "#1a73e8" },
    decision: { label: "Решение", bg: "#fff8e8", color: "#b8860b" },
  };
  const s = MAP[type] ?? MAP.manual;
  return <span style={{ padding: "1px 6px", borderRadius: "var(--radius-s)", fontSize: "10px", fontFamily: "MTS Compact", fontWeight: 500, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("ru-RU"); } catch { return d; }
}

const th: React.CSSProperties = {
  padding: "8px 12px",
  fontFamily: "MTS Compact",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  textAlign: "left",
  background: "var(--color-background-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const td: React.CSSProperties = {
  padding: "8px 12px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-text-primary)",
  verticalAlign: "middle",
};
