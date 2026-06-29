"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { LinkButton, Select, Button, IconButton, DatePicker } from "@/components/ui";
import {
  useProcess,
  useUpdateProcess,
  useUpdateProcessJunction,
  useCreateToBe,
  useDomains,
  useRefList,
  useCreateRef,
  useActivities,
  useCreateActivity,
  useDeleteActivity,
  useReorderActivities,
  useNextActivityId,
  type PmSirporc,
  type PmStatus,
  type PmBuMode,
  type PmImpact,
  type PmMetricStatus,
  type PmActivityType,
  type PmRole,
  type PmSystem,
  type PmRegulation,
  type PmRisk,
  type PmBusinessUnit,
  type PmBuAssignmentOut,
  type PmSystemAssignmentOut,
  type PmRegulationAssignmentOut,
  type PmRiskAssignmentOut,
  type PmRaciRowOut,
  type PmMetricOut,
  type PmAutomationCandidateOut,
} from "@/lib/api/processes";

const IMPACT_LABELS: Record<PmImpact, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };
const METRIC_STATUS_LABELS: Record<PmMetricStatus, string> = { fact: "Факт", estimate: "Оценка", no_data: "Нет данных" };
const STATUS_LABELS: Record<PmStatus, string> = { draft: "Черновик", as_is: "As-Is", to_be: "To-Be" };

const SIRPORC_FIELDS: { key: keyof Omit<PmSirporc, "process_summary">; label: string; hint: string }[] = [
  { key: "suppliers", label: "S — Поставщики", hint: "Кто инициирует / передаёт входные данные" },
  { key: "inputs", label: "I — Входы", hint: "Документы, запросы, данные на входе" },
  { key: "input_requirements", label: "R — Требования к входам", hint: "Критерии качества входных данных" },
  { key: "outputs", label: "O — Выходы", hint: "Документы, решения, данные на выходе" },
  { key: "output_requirements", label: "R — Требования к выходам", hint: "Критерии качества выходных данных" },
  { key: "clients", label: "C — Клиенты", hint: "Кто получает результат" },
];

const SECTIONS_WORKFLOW = ["basic", "sirporc", "business-units", "systems", "regulations", "risks", "raci", "metrics", "pain-auto", "activities", "connections", "changelog", "json"];
const SECTIONS_SERVICE  = ["basic", "sirporc", "business-units", "systems", "regulations", "risks", "competencies", "decision-cases", "activities", "connections", "changelog", "json"];

const SECTION_LABELS: Record<string, string> = {
  basic: "Основное",
  sirporc: "SIRPORC",
  "business-units": "Бизнес-юниты",
  systems: "Системы",
  regulations: "Нормативка",
  risks: "Риски",
  raci: "RACI",
  metrics: "Метрики / SLA",
  "pain-auto": "Боли / Автоматизация",
  competencies: "Компетенции / Трудозатраты",
  "decision-cases": "Decision / Прецеденты",
  activities: "Активности (L4)",
  connections: "Связи",
  changelog: "История изменений",
  json: "JSON",
};

export default function EditProcessPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";

  const { data: proc, isLoading } = useProcess(id);
  const { data: domains } = useDomains();
  const { data: allRoles } = useRefList<PmRole>("roles");
  const { data: allSystems } = useRefList<PmSystem>("systems");
  const { data: allRegulations } = useRefList<PmRegulation>("regulations");
  const { data: allRisks } = useRefList<PmRisk>("risks");
  const { data: allBus } = useRefList<PmBusinessUnit>("business-units");
  const createRole = useCreateRef<PmRole>("roles");
  const createSystem = useCreateRef<PmSystem>("systems");
  const createRegulation = useCreateRef<PmRegulation>("regulations");
  const createRisk = useCreateRef<PmRisk>("risks");

  const { data: activities, isLoading: activitiesLoading } = useActivities(id);
  const createActivity = useCreateActivity(id);
  const reorderActivities = useReorderActivities(id);

  const [newActName, setNewActName] = useState("");
  const [newActOptional, setNewActOptional] = useState(false);
  const [actError, setActError] = useState<string | null>(null);

  const updateBase = useUpdateProcess(id);
  const updateBus = useUpdateProcessJunction(id, "business-units");
  const updateSystems = useUpdateProcessJunction(id, "systems");
  const updateRegulations = useUpdateProcessJunction(id, "regulations");
  const updateRisks = useUpdateProcessJunction(id, "risks");
  const updateRaci = useUpdateProcessJunction(id, "raci");
  const updateMetrics = useUpdateProcessJunction(id, "metrics");
  const updateAutoCandidates = useUpdateProcessJunction(id, "automation-candidates");
  const createToBe = useCreateToBe(id);

  // ── Base fields state
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState("");
  const [ownerRoleId, setOwnerRoleId] = useState<number | "">("");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState<PmStatus>("draft");
  const [lastUpdated, setLastUpdated] = useState("");
  const [nextReview, setNextReview] = useState("");
  const [baseSaved, setBaseSaved] = useState(false);
  const [baseError, setBaseError] = useState<string | null>(null);

  // ── SIRPORC state
  const [sirporc, setSirporc] = useState<PmSirporc>({
    suppliers: [], inputs: [], input_requirements: [],
    process_summary: "", outputs: [], output_requirements: [], clients: [],
  });
  const [sirporcSaved, setSirporcSaved] = useState(false);

  // ── BU state
  const [buMode, setBuMode] = useState<PmBuMode>("all_clients");
  const [buAssignments, setBuAssignments] = useState<{ bu_id: number; notes: string }[]>([]);
  const [buSaved, setBuSaved] = useState(false);

  // ── Systems state
  const [systems, setSystems] = useState<PmSystemAssignmentOut[]>([]);
  const [systemSearch, setSystemSearch] = useState("");
  const [newSystemName, setNewSystemName] = useState("");
  const [sysSaved, setSysSaved] = useState(false);

  // ── Regulations state
  const [regulations, setRegulations] = useState<PmRegulationAssignmentOut[]>([]);
  const [regSearch, setRegSearch] = useState("");
  const [newRegName, setNewRegName] = useState("");
  const [regSaved, setRegSaved] = useState(false);

  // ── Risks state
  const [risks, setRisks] = useState<PmRiskAssignmentOut[]>([]);
  const [riskSearch, setRiskSearch] = useState("");
  const [newRiskName, setNewRiskName] = useState("");
  const [riskSaved, setRiskSaved] = useState(false);

  // ── RACI state (workflow)
  const [raci, setRaci] = useState<PmRaciRowOut[]>([]);
  const [raciRoleSearch, setRaciRoleSearch] = useState("");
  const [raciSaved, setRaciSaved] = useState(false);

  // ── Metrics + SLA state (workflow)
  const [slaDay, setSlaDay] = useState<number | "">("");
  const [metrics, setMetrics] = useState<Omit<PmMetricOut, "id">[]>([]);
  const [metricsSaved, setMetricsSaved] = useState(false);

  // ── Pain points + Automation (workflow)
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [autoCandidates, setAutoCandidates] = useState<Omit<PmAutomationCandidateOut, "id">[]>([]);
  const [painAutoSaved, setPainAutoSaved] = useState(false);

  // ── Competencies + Effort (service)
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [effort, setEffort] = useState({ simple: "", medium: "", complex: "", factors: [] as string[] });
  const [compSaved, setCompSaved] = useState(false);

  // ── Decision + Cases + Improvement (service)
  const [decisionPoints, setDecisionPoints] = useState<{ decision: string; factors: string[] }[]>([]);
  const [improvementCandidates, setImprovementCandidates] = useState<{ idea: string; type: string; impact: string; effort: string; score: string }[]>([]);
  const [decisionSaved, setDecisionSaved] = useState(false);

  // ── Connections
  const [connections, setConnections] = useState<{ direction: string; target_process_id: string; note: string }[]>([]);
  const [connSaved, setConnSaved] = useState(false);

  // ── Changelog
  const [changelog, setChangelog] = useState<Array<{ date: string; author: string; note: string }>>([]);
  const [newChangeNote, setNewChangeNote] = useState("");
  const [changelogSaved, setChangelogSaved] = useState(false);

  // Load process data into state
  useEffect(() => {
    if (!proc) return;
    setName(proc.name);
    setDomainId(proc.domain_id);
    setOwnerRoleId(proc.owner_role_id ?? "");
    setVersion(proc.version);
    setStatus(proc.status);
    setLastUpdated(proc.last_updated ?? "");
    setNextReview(proc.next_review ?? "");
    setSirporc(proc.sirporc ?? { suppliers: [], inputs: [], input_requirements: [], process_summary: "", outputs: [], output_requirements: [], clients: [] });
    setBuMode(proc.bu_mode);
    setBuAssignments(proc.business_units.map(b => ({ bu_id: b.bu_id, notes: b.notes ?? "" })));
    setSystems(proc.systems);
    setRegulations(proc.regulations);
    setRisks(proc.risks);
    setRaci(proc.raci);
    setSlaDay(proc.sla_days ?? "");
    setMetrics(proc.metrics.map(m => ({ name: m.name, value: m.value, unit: m.unit, metric_status: m.metric_status })));
    setPainPoints(proc.pain_points ?? []);
    setAutoCandidates(proc.automation_candidates.map(c => ({ idea: c.idea, impact: c.impact, effort: c.effort, score: c.score })));
    setCompetencies(proc.required_competencies ?? []);
    setEffort({
      simple: (proc.effort_estimation as {simple?: string} | null)?.simple ?? "",
      medium: (proc.effort_estimation as {medium?: string} | null)?.medium ?? "",
      complex: (proc.effort_estimation as {complex?: string} | null)?.complex ?? "",
      factors: (proc.effort_estimation as {factors?: string[]} | null)?.factors ?? [],
    });
    setDecisionPoints((proc.decision_points ?? []).map((d: {decision: string; factors: string[]}) => ({ decision: d.decision, factors: d.factors ?? [] })));
    setImprovementCandidates((proc.improvement_candidates ?? []).map((c: {idea: string; type: string; impact: string; effort: string; score: number}) => ({ idea: c.idea, type: c.type ?? "", impact: c.impact ?? "", effort: c.effort ?? "", score: String(c.score ?? "") })));
    setConnections((proc.connections ?? []).map((c: {direction: string; target_process_id: string; note: string}) => ({ direction: c.direction, target_process_id: c.target_process_id, note: c.note ?? "" })));
    setChangelog((proc.changelog ?? []) as Array<{ date: string; author: string; note: string }>);
  }, [proc]);

  const showSaved = useCallback((set: (v: boolean) => void) => {
    set(true); setTimeout(() => set(false), 2500);
  }, []);

  // ── Save handlers

  const saveBase = async (e: React.FormEvent) => {
    e.preventDefault();
    setBaseError(null);
    try {
      await updateBase.mutateAsync({
        name: name.trim(),
        domain_id: domainId,
        owner_role_id: ownerRoleId !== "" ? Number(ownerRoleId) : null,
        version: version.trim(),
        status,
        last_updated: lastUpdated || null,
        next_review: nextReview || null,
      });
      showSaved(setBaseSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка"); }
  };

  const saveSirporc = async () => {
    setBaseError(null);
    try {
      await updateBase.mutateAsync({ sirporc });
      showSaved(setSirporcSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveBus = async () => {
    setBaseError(null);
    try {
      const body = buMode === "all_clients"
        ? []
        : buAssignments.map(b => ({ bu_id: b.bu_id, notes: b.notes || null }));
      await Promise.all([
        updateBase.mutateAsync({ bu_mode: buMode }),
        updateBus.mutateAsync(body as unknown[]),
      ]);
      showSaved(setBuSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveSystems = async () => {
    setBaseError(null);
    try {
      await updateSystems.mutateAsync(systems.map(s => ({ system_id: s.system_id })));
      showSaved(setSysSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveRegulations = async () => {
    setBaseError(null);
    try {
      await updateRegulations.mutateAsync(regulations.map(r => ({ reg_id: r.reg_id, articles: r.articles, relevance_note: r.relevance_note })));
      showSaved(setRegSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveRisks = async () => {
    setBaseError(null);
    try {
      await updateRisks.mutateAsync(risks.map(r => ({ risk_id: r.risk_id, impact: r.impact, probability: r.probability, control: r.control })));
      showSaved(setRiskSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveRaci = async () => {
    setBaseError(null);
    try {
      await updateRaci.mutateAsync(raci.map(r => ({ role_id: r.role_id, activity_id: r.activity_id, r: r.r, a: r.a, c: r.c, i: r.i })));
      showSaved(setRaciSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveMetrics = async () => {
    setBaseError(null);
    try {
      await Promise.all([
        updateBase.mutateAsync({ sla_days: slaDay !== "" ? Number(slaDay) : null }),
        updateMetrics.mutateAsync(metrics as unknown[]),
      ]);
      showSaved(setMetricsSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const savePainAuto = async () => {
    setBaseError(null);
    try {
      await Promise.all([
        updateBase.mutateAsync({ pain_points: painPoints }),
        updateAutoCandidates.mutateAsync(autoCandidates as unknown[]),
      ]);
      showSaved(setPainAutoSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveCompetencies = async () => {
    setBaseError(null);
    try {
      await updateBase.mutateAsync({
        required_competencies: competencies,
        effort_estimation: { simple: effort.simple, medium: effort.medium, complex: effort.complex, factors: effort.factors },
      });
      showSaved(setCompSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveDecision = async () => {
    setBaseError(null);
    try {
      await updateBase.mutateAsync({
        decision_points: decisionPoints,
        improvement_candidates: improvementCandidates.map(c => ({ ...c, score: c.score ? Number(c.score) : null })),
      });
      showSaved(setDecisionSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const saveConnections = async () => {
    setBaseError(null);
    try {
      await updateBase.mutateAsync({ connections });
      showSaved(setConnSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  const addChangelogEntry = async () => {
    if (!newChangeNote.trim()) return;
    setBaseError(null);
    try {
      const entry = { date: new Date().toISOString().slice(0, 10), author: session?.user?.name ?? "—", note: newChangeNote.trim() };
      const updated = [...changelog, entry];
      await updateBase.mutateAsync({ changelog: updated });
      setChangelog(updated);
      setNewChangeNote("");
      showSaved(setChangelogSaved);
    } catch (err) { setBaseError((err as Error)?.message ?? "Ошибка сохранения"); }
  };

  if (!session) return null;

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}><Spinner size={44} /></div>;
  }

  if (!proc) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>Процесс не найден</p>
        <LinkButton onClick={() => router.push("/processes/edit/processes")} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>К списку</LinkButton>
      </div>
    );
  }

  const isWorkflow = proc.type === "workflow";
  const sections = isWorkflow ? SECTIONS_WORKFLOW : SECTIONS_SERVICE;

  return (
    <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", gap: "32px" }}>
      {/* Sidebar */}
      <div style={{ width: "180px", flexShrink: 0 }}>
        <div style={{ position: "sticky", top: "80px" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)", margin: "0 0 8px" }}>
            Разделы
          </p>
          {sections.map((s) => (
            <a key={s} href={`#section-${s}`} className="ui-navlink">
              {SECTION_LABELS[s]}
            </a>
          ))}
          <div style={{ borderTop: "1px solid var(--color-background-lower)", marginTop: "12px", paddingTop: "12px" }}>
            <LinkButton
              onClick={() => router.push(`/processes/${proc.id}`)}
              iconRight={<Icon name="ArrowRightSize24StyleOutline" size={14} />}
            >
              Просмотр
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
          <LinkButton onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
          <span style={sep}>›</span>
          <LinkButton onClick={() => router.push("/processes/edit")}>Редактирование</LinkButton>
          <span style={sep}>›</span>
          <LinkButton onClick={() => router.push("/processes/edit/processes")}>Процессы</LinkButton>
          <span style={sep}>›</span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>{proc.name}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={typeBadge(isWorkflow)}>{isWorkflow ? "Процедура" : "Услуга"}</span>
                <span style={statusBadge(proc.status)}>{STATUS_LABELS[proc.status]}</span>
                {proc.activity_count > 0 && (
                  <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    {proc.activity_count} активн.
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", color: "var(--color-text-primary)", margin: "0 0 2px" }}>
                {proc.name}
              </h1>
              <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
                {proc.id} · v{proc.version}
                {proc.lifecycle_ref_id && ` · To-Be версия для: ${proc.lifecycle_ref_id}`}
              </p>
            </div>
            {canEdit && !proc.lifecycle_ref_id && (
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!confirm("Создать to-be версию этого процесса?")) return;
                  try {
                    const tb = await createToBe.mutateAsync();
                    router.push(`/processes/edit/processes/${tb.id}`);
                  } catch (err) { alert((err as Error)?.message); }
                }}
                disabled={createToBe.isPending}
              >
                {createToBe.isPending ? "Создание…" : "Создать To-Be"}
              </Button>
            )}
          </div>
        </div>

        {/* ─── Section: Основное ─── */}
        <div id="section-basic" style={sectionCard}>
          <SectionHeader title="Основное" />
          <form onSubmit={saveBase} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={grid2}>
              <div>
                <label style={lbl}>ID <span style={greyText}>(неизменяемый)</span></label>
                <input value={proc.id} disabled style={{ ...inp, opacity: 0.5, fontFamily: "monospace", fontWeight: 700 }} />
              </div>
              <div>
                <label style={lbl}>Название <span style={req}>*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} required disabled={!canEdit} style={inp} />
              </div>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Домен</label>
                <Select value={domainId} onChange={(e) => setDomainId(e.target.value)} disabled={!canEdit} className="ui-select--inp">
                  {domains?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <label style={lbl}>Ответственная роль</label>
                <Select value={ownerRoleId} onChange={(e) => setOwnerRoleId(e.target.value === "" ? "" : Number(e.target.value))} disabled={!canEdit} className="ui-select--inp">
                  <option value="">— не указана —</option>
                  {allRoles?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
            </div>
            <div style={grid3}>
              <div>
                <label style={lbl}>Статус</label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as PmStatus)} disabled={!canEdit} className="ui-select--inp">
                  <option value="draft">Черновик</option>
                  <option value="as_is">As-Is</option>
                  <option value="to_be">To-Be</option>
                </Select>
              </div>
              <div>
                <label style={lbl}>Версия</label>
                <input value={version} onChange={(e) => setVersion(e.target.value)} disabled={!canEdit} style={inp} />
              </div>
              <div>
                <label style={lbl}>Тип</label>
                <input value={isWorkflow ? "Процедура (workflow)" : "Услуга (service)"} disabled style={{ ...inp, opacity: 0.5 }} />
              </div>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Последнее обновление</label>
                <DatePicker value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} disabled={!canEdit} className="ui-select--inp" />
              </div>
              <div>
                <label style={lbl}>Следующий пересмотр</label>
                <DatePicker value={nextReview} onChange={(e) => setNextReview(e.target.value)} disabled={!canEdit} className="ui-select--inp" />
              </div>
            </div>
            {baseError && <p style={errorText}>{baseError}</p>}
            {canEdit && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button type="submit" disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                {baseSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
              </div>
            )}
          </form>
        </div>

        {/* ─── Section: SIRPORC ─── */}
        <div id="section-sirporc" style={sectionCard}>
          <SectionHeader title="SIRPORC" hint="Supplier → Input → (R)equirements → Process → Output → (R)equirements → Clients" />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {SIRPORC_FIELDS.map(({ key, label, hint }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: "0 0 6px" }}>{hint}</p>
                <ListEditor
                  items={(sirporc[key] as string[]) ?? []}
                  onChange={(v) => setSirporc({ ...sirporc, [key]: v })}
                  disabled={!canEdit}
                  placeholder="Добавить пункт..."
                />
              </div>
            ))}
            <div>
              <label style={lbl}>P — Описание процесса</label>
              <textarea
                value={sirporc.process_summary}
                onChange={(e) => setSirporc({ ...sirporc, process_summary: e.target.value })}
                disabled={!canEdit}
                rows={3}
                placeholder="Краткое описание самого процесса"
                style={{ ...inp, resize: "vertical" }}
              />
            </div>
            {canEdit && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={saveSirporc} disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                {sirporcSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
              </div>
            )}
          </div>
        </div>

        {/* ─── Section: Бизнес-юниты ─── */}
        <div id="section-business-units" style={sectionCard}>
          <SectionHeader title="Бизнес-юниты" />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={lbl}>Режим</label>
              <div style={{ display: "flex", gap: "20px" }}>
                {(["all_clients", "specific"] as PmBuMode[]).map((m) => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={buMode === m}
                      onChange={() => setBuMode(m)}
                      disabled={!canEdit}
                      style={{ accentColor: "var(--brand-blue)" }}
                    />
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px" }}>
                      {m === "all_clients" ? "Для всех клиентов" : "Конкретные БЮ"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {buMode === "specific" && (
              <div>
                <label style={lbl}>Список БЮ</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {allBus?.map((bu) => {
                    const assigned = buAssignments.find(b => b.bu_id === bu.id);
                    return (
                      <div key={bu.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="checkbox"
                          checked={!!assigned}
                          disabled={!canEdit}
                          style={{ accentColor: "var(--brand-blue)" }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBuAssignments([...buAssignments, { bu_id: bu.id, notes: "" }]);
                            } else {
                              setBuAssignments(buAssignments.filter(b => b.bu_id !== bu.id));
                            }
                          }}
                        />
                        <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", width: "220px" }}>
                          {bu.name}
                          <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginLeft: "6px" }}>
                            ({bu.type})
                          </span>
                        </span>
                        {assigned && (
                          <input
                            value={assigned.notes}
                            onChange={(e) => setBuAssignments(buAssignments.map(b => b.bu_id === bu.id ? { ...b, notes: e.target.value } : b))}
                            disabled={!canEdit}
                            placeholder="Примечание (нюансы)"
                            style={{ ...inp, flex: 1 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {canEdit && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={saveBus} disabled={updateBus.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                {buSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
              </div>
            )}
          </div>
        </div>

        {/* ─── Section: Системы ─── */}
        <div id="section-systems" style={sectionCard}>
          <SectionHeader title="Системы" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {systems.map((s) => (
              <div key={s.system_id} style={tagRow}>
                <span style={tag}>{s.system_name}</span>
                {canEdit && (
                  <button onClick={() => setSystems(systems.filter(x => x.system_id !== s.system_id))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>
                )}
              </div>
            ))}
            {canEdit && (
              <>
                <RefSearchAdd
                  placeholder="Найти систему..."
                  searchValue={systemSearch}
                  onSearchChange={setSystemSearch}
                  options={(allSystems ?? []).filter(s => !systems.find(x => x.system_id === s.id) && s.name.toLowerCase().includes(systemSearch.toLowerCase()))}
                  onSelect={(s) => { setSystems([...systems, { system_id: s.id, system_name: s.name }]); setSystemSearch(""); }}
                  newName={newSystemName}
                  onNewNameChange={setNewSystemName}
                  onCreateNew={async () => {
                    if (!newSystemName.trim()) return;
                    const created = await createSystem.mutateAsync({ name: newSystemName.trim() });
                    setSystems([...systems, { system_id: created.id, system_name: created.name }]);
                    setNewSystemName("");
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveSystems} disabled={updateSystems.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {sysSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Section: Нормативка ─── */}
        <div id="section-regulations" style={sectionCard}>
          <SectionHeader title="Нормативные акты" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {regulations.map((r) => (
              <div key={r.reg_id} style={{ ...tagRow, flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                  <span style={tag}>{r.reg_name}</span>
                  {canEdit && (
                    <button onClick={() => setRegulations(regulations.filter(x => x.reg_id !== r.reg_id))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>
                  )}
                </div>
                {canEdit && (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <input
                      value={r.articles ?? ""}
                      onChange={(e) => setRegulations(regulations.map(x => x.reg_id === r.reg_id ? { ...x, articles: e.target.value } : x))}
                      placeholder="Статьи (напр. ст. 5, 12)"
                      style={{ ...inp, flex: 1 }}
                    />
                    <input
                      value={r.relevance_note ?? ""}
                      onChange={(e) => setRegulations(regulations.map(x => x.reg_id === r.reg_id ? { ...x, relevance_note: e.target.value } : x))}
                      placeholder="Примечание о релевантности"
                      style={{ ...inp, flex: 2 }}
                    />
                  </div>
                )}
              </div>
            ))}
            {canEdit && (
              <>
                <RefSearchAdd
                  placeholder="Найти нормативный акт..."
                  searchValue={regSearch}
                  onSearchChange={setRegSearch}
                  options={(allRegulations ?? []).filter(r => !regulations.find(x => x.reg_id === r.id) && r.name.toLowerCase().includes(regSearch.toLowerCase()))}
                  onSelect={(r) => { setRegulations([...regulations, { reg_id: r.id, reg_name: r.name, articles: null, relevance_note: null }]); setRegSearch(""); }}
                  newName={newRegName}
                  onNewNameChange={setNewRegName}
                  onCreateNew={async () => {
                    if (!newRegName.trim()) return;
                    const created = await createRegulation.mutateAsync({ name: newRegName.trim() });
                    setRegulations([...regulations, { reg_id: created.id, reg_name: created.name, articles: null, relevance_note: null }]);
                    setNewRegName("");
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveRegulations} disabled={updateRegulations.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {regSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Section: Риски ─── */}
        <div id="section-risks" style={sectionCard}>
          <SectionHeader title="Риски" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {risks.map((r) => (
              <div key={r.risk_id} style={{ border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={tag}>{r.risk_name}</span>
                  {canEdit && (
                    <button onClick={() => setRisks(risks.filter(x => x.risk_id !== r.risk_id))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>
                  )}
                </div>
                {canEdit && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Select
                      value={r.impact ?? ""}
                      onChange={(e) => setRisks(risks.map(x => x.risk_id === r.risk_id ? { ...x, impact: (e.target.value as PmImpact) || null } : x))}
                      className="ui-select--inp"
                      style={{ flex: 1 }}
                    >
                      <option value="">Влияние</option>
                      {(["high","medium","low"] as PmImpact[]).map(v => <option key={v} value={v}>{IMPACT_LABELS[v]}</option>)}
                    </Select>
                    <Select
                      value={r.probability ?? ""}
                      onChange={(e) => setRisks(risks.map(x => x.risk_id === r.risk_id ? { ...x, probability: (e.target.value as PmImpact) || null } : x))}
                      className="ui-select--inp"
                      style={{ flex: 1 }}
                    >
                      <option value="">Вероятность</option>
                      {(["high","medium","low"] as PmImpact[]).map(v => <option key={v} value={v}>{IMPACT_LABELS[v]}</option>)}
                    </Select>
                    <input
                      value={r.control ?? ""}
                      onChange={(e) => setRisks(risks.map(x => x.risk_id === r.risk_id ? { ...x, control: e.target.value } : x))}
                      placeholder="Меры контроля"
                      style={{ ...inp, flex: 2 }}
                    />
                  </div>
                )}
              </div>
            ))}
            {canEdit && (
              <>
                <RefSearchAdd
                  placeholder="Найти риск..."
                  searchValue={riskSearch}
                  onSearchChange={setRiskSearch}
                  options={(allRisks ?? []).filter(r => !risks.find(x => x.risk_id === r.id) && r.name.toLowerCase().includes(riskSearch.toLowerCase()))}
                  onSelect={(r) => { setRisks([...risks, { risk_id: r.id, risk_name: r.name, impact: null, probability: null, control: null }]); setRiskSearch(""); }}
                  newName={newRiskName}
                  onNewNameChange={setNewRiskName}
                  onCreateNew={async () => {
                    if (!newRiskName.trim()) return;
                    const created = await createRisk.mutateAsync({ name: newRiskName.trim() });
                    setRisks([...risks, { risk_id: created.id, risk_name: created.name, impact: null, probability: null, control: null }]);
                    setNewRiskName("");
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveRisks} disabled={updateRisks.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {riskSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Section: RACI (workflow only) ─── */}
        {isWorkflow && (
          <div id="section-raci" style={sectionCard}>
            <SectionHeader title="RACI" hint="Роли и ответственности. R=Responsible, A=Accountable, C=Consulted, I=Informed" />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {raci.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={th}>Роль</th>
                        {["R","A","C","I"].map(h => <th key={h} style={{ ...th, width: "60px", textAlign: "center" }}>{h}</th>)}
                        {canEdit && <th style={{ ...th, width: "40px" }} />}
                      </tr>
                    </thead>
                    <tbody>
                      {raci.map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--color-background-lower)" }}>
                          <td style={td}>{row.role_name}</td>
                          {(["r","a","c","i"] as const).map(col => (
                            <td key={col} style={{ ...td, textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={row[col]}
                                disabled={!canEdit}
                                style={{ accentColor: "var(--brand-blue)" }}
                                onChange={(e) => setRaci(raci.map((x, j) => j === i ? { ...x, [col]: e.target.checked } : x))}
                              />
                            </td>
                          ))}
                          {canEdit && (
                            <td style={td}>
                              <button onClick={() => setRaci(raci.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {canEdit && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Select
                    value={raciRoleSearch}
                    onChange={(e) => {
                      const roleId = Number(e.target.value);
                      if (!roleId) return;
                      const role = allRoles?.find(r => r.id === roleId);
                      if (!role || raci.find(r => r.role_id === roleId)) { setRaciRoleSearch(""); return; }
                      setRaci([...raci, { role_id: role.id, role_name: role.name, activity_id: null, r: false, a: false, c: false, i: false }]);
                      setRaciRoleSearch("");
                    }}
                    className="ui-select--inp"
                    style={{ width: "260px" }}
                  >
                    <option value="">+ Добавить роль в RACI</option>
                    {(allRoles ?? []).filter(r => !raci.find(x => x.role_id === r.id)).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                  <button onClick={saveRaci} disabled={updateRaci.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {raciSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Section: Метрики + SLA (workflow) ─── */}
        {isWorkflow && (
          <div id="section-metrics" style={sectionCard}>
            <SectionHeader title="Метрики / SLA" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lbl}>SLA (рабочих дней)</label>
                <input
                  type="number"
                  min={0}
                  value={slaDay}
                  onChange={(e) => setSlaDay(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!canEdit}
                  style={{ ...inp, width: "160px" }}
                />
              </div>
              <div>
                <label style={lbl}>Метрики</label>
                {metrics.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <input
                      value={m.name}
                      onChange={(e) => setMetrics(metrics.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      disabled={!canEdit}
                      placeholder="Название"
                      style={{ ...inp, flex: 2 }}
                    />
                    <input
                      value={m.value ?? ""}
                      onChange={(e) => setMetrics(metrics.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                      disabled={!canEdit}
                      placeholder="Значение"
                      style={{ ...inp, flex: 1 }}
                    />
                    <input
                      value={m.unit ?? ""}
                      onChange={(e) => setMetrics(metrics.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}
                      disabled={!canEdit}
                      placeholder="Ед."
                      style={{ ...inp, width: "70px" }}
                    />
                    <Select
                      value={m.metric_status}
                      onChange={(e) => setMetrics(metrics.map((x, j) => j === i ? { ...x, metric_status: e.target.value as PmMetricStatus } : x))}
                      disabled={!canEdit}
                      className="ui-select--inp"
                      style={{ width: "120px" }}
                    >
                      {(Object.keys(METRIC_STATUS_LABELS) as PmMetricStatus[]).map(s => (
                        <option key={s} value={s}>{METRIC_STATUS_LABELS[s]}</option>
                      ))}
                    </Select>
                    {canEdit && <button onClick={() => setMetrics(metrics.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>}
                  </div>
                ))}
                {canEdit && (
                  <button
                    onClick={() => setMetrics([...metrics, { name: "", value: null, unit: null, metric_status: "no_data" }])}
                    className="ui-btn ui-btn--secondary ui-btn--xs"
                  >
                    + Добавить метрику
                  </button>
                )}
              </div>
              {canEdit && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveMetrics} disabled={updateMetrics.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {metricsSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Section: Боли / Автоматизация (workflow) ─── */}
        {isWorkflow && (
          <div id="section-pain-auto" style={sectionCard}>
            <SectionHeader title="Боли / Кандидаты на автоматизацию" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={lbl}>Боли (pain points)</label>
                <ListEditor items={painPoints} onChange={setPainPoints} disabled={!canEdit} placeholder="Описание проблемы..." />
              </div>
              <div>
                <label style={lbl}>Кандидаты на автоматизацию</label>
                {autoCandidates.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
                    <textarea
                      value={c.idea}
                      onChange={(e) => setAutoCandidates(autoCandidates.map((x, j) => j === i ? { ...x, idea: e.target.value } : x))}
                      disabled={!canEdit}
                      placeholder="Идея автоматизации"
                      rows={2}
                      style={{ ...inp, flex: 3, resize: "vertical" }}
                    />
                    <input value={c.impact ?? ""} onChange={(e) => setAutoCandidates(autoCandidates.map((x, j) => j === i ? { ...x, impact: e.target.value } : x))} disabled={!canEdit} placeholder="Эффект" style={{ ...inp, flex: 1 }} />
                    <input value={c.effort ?? ""} onChange={(e) => setAutoCandidates(autoCandidates.map((x, j) => j === i ? { ...x, effort: e.target.value } : x))} disabled={!canEdit} placeholder="Усилия" style={{ ...inp, flex: 1 }} />
                    <input type="number" value={c.score ?? ""} onChange={(e) => setAutoCandidates(autoCandidates.map((x, j) => j === i ? { ...x, score: e.target.value === "" ? null : Number(e.target.value) } : x))} disabled={!canEdit} placeholder="Балл" style={{ ...inp, width: "60px" }} />
                    {canEdit && <button onClick={() => setAutoCandidates(autoCandidates.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>}
                  </div>
                ))}
                {canEdit && (
                  <button onClick={() => setAutoCandidates([...autoCandidates, { idea: "", impact: null, effort: null, score: null }])} className="ui-btn ui-btn--secondary ui-btn--xs">
                    + Добавить
                  </button>
                )}
              </div>
              {canEdit && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={savePainAuto} disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {painAutoSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Section: Компетенции / Трудозатраты (service) ─── */}
        {!isWorkflow && (
          <div id="section-competencies" style={sectionCard}>
            <SectionHeader title="Компетенции / Трудозатраты" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={lbl}>Требуемые компетенции</label>
                <ListEditor items={competencies} onChange={setCompetencies} disabled={!canEdit} placeholder="Компетенция..." />
              </div>
              <div>
                <label style={lbl}>Оценка трудозатрат</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  {(["simple","medium","complex"] as const).map(k => (
                    <div key={k} style={{ flex: 1 }}>
                      <label style={{ ...lbl, fontSize: "11px" }}>{k === "simple" ? "Простой" : k === "medium" ? "Средний" : "Сложный"}</label>
                      <input value={effort[k]} onChange={(e) => setEffort({ ...effort, [k]: e.target.value })} disabled={!canEdit} placeholder="напр. 1-3 дня" style={inp} />
                    </div>
                  ))}
                </div>
                <label style={{ ...lbl, fontSize: "11px" }}>Факторы сложности</label>
                <ListEditor items={effort.factors} onChange={(v) => setEffort({ ...effort, factors: v })} disabled={!canEdit} placeholder="Фактор..." />
              </div>
              {canEdit && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveCompetencies} disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {compSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Section: Decision / Прецеденты (service) ─── */}
        {!isWorkflow && (
          <div id="section-decision-cases" style={sectionCard}>
            <SectionHeader title="Decision points / Кандидаты на улучшение" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={lbl}>Decision points</label>
                {decisionPoints.map((dp, i) => (
                  <div key={i} style={{ border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", padding: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                      <input
                        value={dp.decision}
                        onChange={(e) => setDecisionPoints(decisionPoints.map((x, j) => j === i ? { ...x, decision: e.target.value } : x))}
                        disabled={!canEdit}
                        placeholder="Вопрос / точка принятия решения"
                        style={{ ...inp, flex: 1 }}
                      />
                      {canEdit && <button onClick={() => setDecisionPoints(decisionPoints.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>}
                    </div>
                    <ListEditor
                      items={dp.factors}
                      onChange={(v) => setDecisionPoints(decisionPoints.map((x, j) => j === i ? { ...x, factors: v } : x))}
                      disabled={!canEdit}
                      placeholder="Фактор..."
                    />
                  </div>
                ))}
                {canEdit && (
                  <button onClick={() => setDecisionPoints([...decisionPoints, { decision: "", factors: [] }])} className="ui-btn ui-btn--secondary ui-btn--xs">
                    + Добавить decision point
                  </button>
                )}
              </div>
              <div>
                <label style={lbl}>Кандидаты на улучшение</label>
                {improvementCandidates.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <input value={c.idea} onChange={(e) => setImprovementCandidates(improvementCandidates.map((x, j) => j === i ? { ...x, idea: e.target.value } : x))} disabled={!canEdit} placeholder="Идея" style={{ ...inp, flex: 3 }} />
                    <Select value={c.type} onChange={(e) => setImprovementCandidates(improvementCandidates.map((x, j) => j === i ? { ...x, type: e.target.value } : x))} disabled={!canEdit} className="ui-select--inp" style={{ flex: 1 }}>
                      <option value="">Тип</option>
                      {["methodology","knowledge","technology","process"].map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <input value={c.impact} onChange={(e) => setImprovementCandidates(improvementCandidates.map((x, j) => j === i ? { ...x, impact: e.target.value } : x))} disabled={!canEdit} placeholder="Эффект" style={{ ...inp, flex: 1 }} />
                    <input value={c.effort} onChange={(e) => setImprovementCandidates(improvementCandidates.map((x, j) => j === i ? { ...x, effort: e.target.value } : x))} disabled={!canEdit} placeholder="Усилия" style={{ ...inp, flex: 1 }} />
                    {canEdit && <button onClick={() => setImprovementCandidates(improvementCandidates.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>}
                  </div>
                ))}
                {canEdit && (
                  <button onClick={() => setImprovementCandidates([...improvementCandidates, { idea: "", type: "", impact: "", effort: "", score: "" }])} className="ui-btn ui-btn--secondary ui-btn--xs">
                    + Добавить
                  </button>
                )}
              </div>
              {canEdit && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveDecision} disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {decisionSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Section: Активности (L4) ─── */}
        <ActivitiesSection
          processId={id}
          processType={proc.type}
          activities={activities ?? []}
          isLoading={activitiesLoading}
          canEdit={canEdit}
          newActName={newActName}
          setNewActName={setNewActName}
          newActOptional={newActOptional}
          setNewActOptional={setNewActOptional}
          actError={actError}
          setActError={setActError}
          createActivity={createActivity}
          reorderActivities={reorderActivities}
          router={router}
        />

        {/* ─── Section: Связи ─── */}
        <div id="section-connections" style={sectionCard}>
          <SectionHeader title="Связи с процессами" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {connections.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "8px" }}>
                <Select value={c.direction} onChange={(e) => setConnections(connections.map((x, j) => j === i ? { ...x, direction: e.target.value } : x))} disabled={!canEdit} className="ui-select--inp" style={{ width: "130px" }}>
                  <option value="up">Вышестоящий</option>
                  <option value="down">Подчинённый</option>
                  <option value="related">Связанный</option>
                </Select>
                <input value={c.target_process_id} onChange={(e) => setConnections(connections.map((x, j) => j === i ? { ...x, target_process_id: e.target.value } : x))} disabled={!canEdit} placeholder="ID процесса" style={{ ...inp, flex: 1, fontFamily: "monospace" }} />
                <input value={c.note} onChange={(e) => setConnections(connections.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} disabled={!canEdit} placeholder="Примечание" style={{ ...inp, flex: 2 }} />
                {canEdit && <button onClick={() => setConnections(connections.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>}
              </div>
            ))}
            {canEdit && (
              <>
                <button onClick={() => setConnections([...connections, { direction: "related", target_process_id: "", note: "" }])} className="ui-btn ui-btn--secondary ui-btn--xs">
                  + Добавить связь
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={saveConnections} disabled={updateBase.isPending} className="ui-btn ui-btn--primary ui-btn--s">Сохранить</button>
                  {connSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} />Сохранено</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Section: Changelog ─── */}
        <div id="section-changelog" style={sectionCard}>
          <SectionHeader title="История изменений" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(proc.changelog ?? []).length === 0 && (
              <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)" }}>Нет записей</p>
            )}
            {(proc.changelog ?? []).map((entry: {date: string; author: string; note: string}, i: number) => (
              <div key={i} style={{ padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
                <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: "0 0 2px" }}>
                  {entry.date} · {entry.author}
                </p>
                <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", margin: 0 }}>{entry.note}</p>
              </div>
            ))}
            {canEdit && (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <input
                  value={newChangeNote}
                  onChange={(e) => setNewChangeNote(e.target.value)}
                  placeholder="Описание изменения..."
                  style={{ ...inp, flex: 1 }}
                />
                <button onClick={addChangelogEntry} disabled={updateBase.isPending || !newChangeNote.trim()} className="ui-btn ui-btn--primary ui-btn--s">
                  Добавить
                </button>
                {changelogSaved && <span style={savedText}><Icon name="CheckCircleSize24StyleOutline" size={14} /></span>}
              </div>
            )}
          </div>
        </div>

        {/* ─── Section: JSON ─── */}
        <div id="section-json" style={sectionCard}>
          <SectionHeader title="JSON (отладка)" />
          <pre style={{
            background: "var(--color-background-secondary)",
            borderRadius: "var(--radius-m)",
            padding: "12px",
            fontSize: "11px",
            fontFamily: "monospace",
            overflowX: "auto",
            maxHeight: "400px",
            overflowY: "auto",
            color: "var(--color-text-primary)",
          }}>
            {JSON.stringify(proc, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Activities section component ─────────────────────────────────────────────

function ActivitiesSection({
  processId,
  processType,
  activities,
  isLoading,
  canEdit,
  newActName,
  setNewActName,
  newActOptional,
  setNewActOptional,
  actError,
  setActError,
  createActivity,
  reorderActivities,
  router,
}: {
  processId: string;
  processType: string;
  activities: import("@/lib/api/processes").PmActivity[];
  isLoading: boolean;
  canEdit: boolean;
  newActName: string;
  setNewActName: (v: string) => void;
  newActOptional: boolean;
  setNewActOptional: (v: boolean) => void;
  actError: string | null;
  setActError: (v: string | null) => void;
  createActivity: ReturnType<typeof useCreateActivity>;
  reorderActivities: ReturnType<typeof useReorderActivities>;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}) {
  const isWorkflow = processType === "workflow";

  const { data: nextId } = useNextActivityId(processId, newActOptional, canEdit);

  const ACT_TYPE_LABELS: Record<string, string> = { manual: "Ручная", system: "Системная", decision: "Решение" };

  const handleAddActivity = async () => {
    if (!newActName.trim()) { setActError("Введите название активности"); return; }
    if (!nextId?.suggested_id) { setActError("Не удалось получить ID"); return; }
    setActError(null);
    try {
      await createActivity.mutateAsync({
        id: nextId.suggested_id,
        parent_process_id: processId,
        order_index: activities.length,
        name: newActName.trim(),
        is_optional: newActOptional,
      });
      setNewActName("");
      setNewActOptional(false);
    } catch (err) {
      setActError((err as Error)?.message ?? "Ошибка создания");
    }
  };

  const moveActivity = async (idx: number, dir: -1 | 1) => {
    const newOrder = activities.map((a, i) => ({ id: a.id, order_index: i }));
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx].order_index, newOrder[swapIdx].order_index] = [newOrder[swapIdx].order_index, newOrder[idx].order_index];
    await reorderActivities.mutateAsync(newOrder);
  };

  return (
    <div id="section-activities" style={sectionCard}>
      <SectionHeader
        title="Активности (L4)"
        hint={isWorkflow ? "Шаги процедуры в порядке выполнения" : "Фазы услуги (обязательные и опциональные)"}
      />

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}><Spinner size={24} /></div>
      ) : activities.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>
          Активностей пока нет
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
          {activities.map((act, idx) => (
            <ActivityRow
              key={act.id}
              act={act}
              idx={idx}
              total={activities.length}
              isWorkflow={isWorkflow}
              canEdit={canEdit}
              actTypeLbl={ACT_TYPE_LABELS}
              onMove={moveActivity}
              onEdit={() => router.push(`/processes/edit/processes/${processId}/activities/${act.id}`)}
              processId={processId}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <div style={{ borderTop: "1px solid var(--color-background-lower)", paddingTop: "14px" }}>
          <label style={{ ...lbl, marginBottom: "8px" }}>Добавить активность</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={newActName}
              onChange={(e) => setNewActName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddActivity(); } }}
              placeholder="Название активности..."
              style={{ ...inp, flex: 1, minWidth: "200px" }}
            />
            {!isWorkflow && (
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontFamily: "MTS Compact", fontSize: "13px", whiteSpace: "nowrap" }}>
                <input
                  type="checkbox"
                  checked={newActOptional}
                  onChange={(e) => setNewActOptional(e.target.checked)}
                  style={{ accentColor: "var(--brand-blue)" }}
                />
                Опциональная
              </label>
            )}
            <button onClick={handleAddActivity} disabled={createActivity.isPending} className="ui-btn ui-btn--primary ui-btn--s">
              {createActivity.isPending ? "…" : "+ Добавить"}
            </button>
          </div>
          {nextId && (
            <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px", marginBottom: 0 }}>
              ID: {nextId.suggested_id}
            </p>
          )}
          {actError && <p style={{ ...errorText, marginTop: "6px" }}>{actError}</p>}
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  act,
  idx,
  total,
  isWorkflow,
  canEdit,
  actTypeLbl,
  onMove,
  onEdit,
  processId,
}: {
  act: import("@/lib/api/processes").PmActivity;
  idx: number;
  total: number;
  isWorkflow: boolean;
  canEdit: boolean;
  actTypeLbl: Record<string, string>;
  onMove: (idx: number, dir: -1 | 1) => void;
  onEdit: () => void;
  processId: string;
}) {
  const del = useDeleteActivity(processId, act.id);
  const [confirming, setConfirming] = useState(false);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      background: "var(--color-background-secondary)",
      borderRadius: "var(--radius-m)",
      border: "1px solid var(--color-background-lower)",
    }}>
      {/* Order controls */}
      {canEdit && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <button onClick={() => onMove(idx, -1)} disabled={idx === 0} className="ui-iconbtn"><Icon name="ArrowUpSize24StyleOutline" size={14} /></button>
          <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1} className="ui-iconbtn"><Icon name="ArrowDownSize24StyleOutline" size={14} /></button>
        </div>
      )}

      {/* Index */}
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)", width: "20px", textAlign: "right", flexShrink: 0 }}>
        {act.order_index + 1}
      </span>

      {/* Type badge */}
      {isWorkflow && act.activity_type && (
        <span style={{
          padding: "1px 6px",
          borderRadius: "var(--radius-s)",
          fontSize: "10px",
          fontFamily: "MTS Compact",
          fontWeight: 500,
          background: "var(--color-background-primary)",
          border: "1px solid var(--color-background-lower)",
          color: "var(--color-text-secondary)",
          flexShrink: 0,
        }}>
          {actTypeLbl[act.activity_type] ?? act.activity_type}
        </span>
      )}
      {!isWorkflow && (
        <span style={{
          padding: "1px 6px",
          borderRadius: "var(--radius-s)",
          fontSize: "10px",
          fontFamily: "MTS Compact",
          background: act.is_optional ? "var(--color-accent-warning-bg)" : "var(--color-accent-positive-bg)",
          border: "1px solid transparent",
          color: act.is_optional ? "var(--color-text-primary)" : "var(--color-accent-positive)",
          flexShrink: 0,
        }}>
          {act.is_optional ? "Опц." : "Обяз."}
        </span>
      )}

      {/* Name */}
      <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {act.name}
      </span>

      {/* ID */}
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>{act.id}</span>

      {/* Actions */}
      {canEdit && (
        <>
          <LinkButton onClick={onEdit} style={{ fontSize: "13px" }}>Изм.</LinkButton>
          {confirming ? (
            <>
              <Button size="xs" variant="negative" onClick={async () => { try { await del.mutateAsync(); } catch (e) { alert((e as Error).message); setConfirming(false); } }}>Удалить</Button>
              <Button size="xs" variant="secondary" onClick={() => setConfirming(false)}>Отмена</Button>
            </>
          ) : (
            <IconButton size={28} danger label="Удалить" onClick={() => setConfirming(true)}><Icon name="CrossSize16StyleOutline" size={14} /></IconButton>
          )}
        </>
      )}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h2 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", margin: "0 0 2px" }}>{title}</h2>
      {hint && <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  disabled,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
          <input
            value={item}
            onChange={(e) => onChange(items.map((x, j) => j === i ? e.target.value : x))}
            disabled={disabled}
            style={{ ...inp, flex: 1 }}
          />
          {!disabled && (
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="ui-iconbtn"><Icon name="CrossSize16StyleOutline" size={14} /></button>
          )}
        </div>
      ))}
      {!disabled && (
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }
            }}
            placeholder={placeholder}
            style={{ ...inp, flex: 1 }}
          />
          <button
            onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}
            className="ui-btn ui-btn--secondary ui-btn--xs"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

function RefSearchAdd<T extends { id: number; name: string }>({
  placeholder,
  searchValue,
  onSearchChange,
  options,
  onSelect,
  newName,
  onNewNameChange,
  onCreateNew,
}: {
  placeholder: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  options: T[];
  onSelect: (item: T) => void;
  newName: string;
  onNewNameChange: (v: string) => void;
  onCreateNew: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ position: "relative" }}>
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inp, width: "100%" }}
        />
        {searchValue && options.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-background-lower)",
            borderRadius: "var(--radius-m)",
            boxShadow: "var(--shadow-middle)",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
          }}>
            {options.slice(0, 8).map((o) => (
              <div
                key={o.id}
                onClick={() => onSelect(o)}
                style={{
                  padding: "8px 12px",
                  fontFamily: "MTS Compact",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "var(--color-text-primary)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {o.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="Или создать новый..."
          style={{ ...inp, flex: 1 }}
        />
        <button onClick={onCreateNew} disabled={!newName.trim()} className="ui-btn ui-btn--secondary ui-btn--xs">
          + Создать
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionCard: React.CSSProperties = {
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)",
  padding: "20px 24px",
  marginBottom: "16px",
  scrollMarginTop: "80px",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  marginBottom: "6px",
};

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

const tag: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  background: "var(--color-background-secondary)",
  border: "1px solid var(--color-background-lower)",
  borderRadius: "var(--radius-s)",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  color: "var(--color-text-primary)",
};

const tagRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" };

const th: React.CSSProperties = {
  padding: "8px 12px",
  fontFamily: "MTS Compact",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--color-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  borderBottom: "1px solid var(--color-background-lower)",
};

const td: React.CSSProperties = {
  padding: "8px 12px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-text-primary)",
};

const savedText: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-accent-positive)",
};

const errorText: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-accent-negative)",
  margin: 0,
};

const sep: React.CSSProperties = { color: "var(--color-text-tertiary)" };

const greyText: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "11px",
  fontWeight: 400,
  color: "var(--color-text-tertiary)",
};

const req: React.CSSProperties = { color: "var(--color-accent-negative)" };

function typeBadge(isWorkflow: boolean): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "var(--radius-s)",
    fontSize: "11px",
    fontFamily: "MTS Compact",
    fontWeight: 500,
    background: isWorkflow ? "var(--color-accent-brand-bg)" : "var(--color-accent-positive-bg)",
    color: isWorkflow ? "var(--color-text-brand)" : "var(--color-accent-positive)",
    border: "1px solid transparent",
  };
}

function statusBadge(status: PmStatus): React.CSSProperties {
  const colors: Record<PmStatus, string> = { draft: "var(--color-text-tertiary)", as_is: "var(--color-accent-positive)", to_be: "var(--brand-blue)" };
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "var(--radius-s)",
    fontSize: "11px",
    fontFamily: "MTS Compact",
    fontWeight: 500,
    background: "var(--color-background-secondary)",
    color: colors[status],
    border: "1px solid var(--color-background-lower)",
  };
}
