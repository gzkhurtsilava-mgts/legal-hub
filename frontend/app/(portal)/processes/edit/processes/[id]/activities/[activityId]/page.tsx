"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import {
  useProcess,
  useActivity,
  useUpdateActivity,
  useSops,
  useCreateSop,
  useDeleteSop,
  type PmActivityType,
  type PmActivityUpdate,
  type PmDataOperation,
  type PmDecisionBranch,
} from "@/lib/api/processes";

// ─── Shared inline styles ──────────────────────────────────────────────────────

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
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid var(--color-background-lower)",
  borderRadius: "var(--radius-m)",
  fontFamily: "MTS Compact",
  fontSize: "14px",
  color: "var(--color-text-primary)",
  background: "var(--color-background-primary)",
  outline: "none",
};

const textarea: React.CSSProperties = {
  ...inp,
  minHeight: "80px",
  resize: "vertical",
};

const select: React.CSSProperties = {
  ...inp,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  padding: "10px 24px",
  background: "var(--brand-blue)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-m)",
  fontFamily: "MTS Compact",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  ...saveBtn,
  background: "transparent",
  color: "var(--color-text-secondary)",
  border: "1px solid var(--color-background-lower)",
};

const removeBtn: React.CSSProperties = {
  padding: "4px 8px",
  background: "transparent",
  color: "var(--color-text-tertiary)",
  border: "none",
  borderRadius: "var(--radius-s)",
  fontFamily: "MTS Compact",
  fontSize: "12px",
  cursor: "pointer",
};

const tagBadge: React.CSSProperties = {
  padding: "2px 8px",
  borderRadius: "var(--radius-s)",
  fontSize: "11px",
  fontFamily: "MTS Compact",
  fontWeight: 500,
};

const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

const ACT_TYPE_LABELS: Record<PmActivityType, string> = {
  manual: "Ручная",
  system: "Системная",
  decision: "Решение / Ветвление",
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ActivityEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const processId = params.id as string;
  const activityId = params.activityId as string;

  const { data: proc, isLoading: procLoading } = useProcess(processId);
  const { data: act, isLoading: actLoading } = useActivity(processId, activityId);
  const updateActivity = useUpdateActivity(processId, activityId);
  const { data: sops, isLoading: sopsLoading } = useSops(processId, activityId);

  const isWorkflow = proc?.type === "workflow";
  const canEdit = session?.user?.role === "admin" || session?.user?.role === "lawyer";

  // ── form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [conditionNote, setConditionNote] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [activityType, setActivityType] = useState<PmActivityType | "">("");
  const [duration, setDuration] = useState("");
  const [automationPotential, setAutomationPotential] = useState<string>("");
  const [phaseNumber, setPhaseNumber] = useState<string>("");
  const [qualityCriteria, setQualityCriteria] = useState<string[]>([]);
  const [dataOperations, setDataOperations] = useState<PmDataOperation[]>([]);
  const [decisionLogic, setDecisionLogic] = useState<PmDecisionBranch[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!act) return;
    setName(act.name ?? "");
    setDescription(act.description ?? "");
    setConditionNote(act.condition_note ?? "");
    setIsOptional(act.is_optional ?? false);
    setActivityType((act.activity_type as PmActivityType) ?? "");
    setDuration(act.duration ?? "");
    setAutomationPotential(act.automation_potential != null ? String(act.automation_potential) : "");
    setPhaseNumber(act.phase_number != null ? String(act.phase_number) : "");
    setQualityCriteria(act.quality_criteria ?? []);
    setDataOperations((act.data_operations as PmDataOperation[]) ?? []);
    setDecisionLogic((act.decision_logic as PmDecisionBranch[]) ?? []);
    setDirty(false);
  }, [act]);

  const handleSave = async () => {
    if (!name.trim()) { setSaveError("Название обязательно"); return; }
    setSaveError(null);
    setSaving(true);
    try {
      const body: PmActivityUpdate = {
        name: name.trim(),
        description: description.trim() || null,
        condition_note: conditionNote.trim() || null,
        is_optional: isOptional,
        activity_type: activityType || null,
        duration: duration.trim() || null,
        automation_potential: (() => { const n = parseInt(automationPotential, 10); return automationPotential !== "" && !Number.isNaN(n) ? n : null; })(),
        ...(isWorkflow ? { data_operations: dataOperations, decision_logic: decisionLogic } : {}),
        ...(!isWorkflow ? {
          phase_number: (() => { const n = parseInt(phaseNumber, 10); return phaseNumber !== "" && !Number.isNaN(n) ? n : null; })(),
          quality_criteria: qualityCriteria,
        } : {}),
      };
      await updateActivity.mutateAsync(body);
      setDirty(false);
    } catch (err) {
      setSaveError((err as Error)?.message ?? "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = procLoading || actLoading;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!act || !proc) {
    return <p style={{ padding: "40px", fontFamily: "MTS Compact" }}>Активность не найдена</p>;
  }

  return (
    <div style={page}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <button onClick={() => router.push("/processes/edit/processes")} style={removeBtn}>
          Процессы
        </button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>/</span>
        <button onClick={() => router.push(`/processes/edit/processes/${processId}`)} style={removeBtn}>
          {proc.name}
        </button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>/</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)" }}>
          Активность {act.id}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "MTS Wide", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>
            {act.name}
          </h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{act.id}</span>
            <span style={{ ...tagBadge, background: isWorkflow ? "#e8f0fe" : "#e8f5e9", color: isWorkflow ? "#1a73e8" : "#2e7d32" }}>
              {isWorkflow ? "Workflow" : "Service"}
            </span>
            {isWorkflow && act.activity_type && (
              <span style={{ ...tagBadge, background: "var(--color-background-lower)", color: "var(--color-text-secondary)" }}>
                {ACT_TYPE_LABELS[act.activity_type as PmActivityType]}
              </span>
            )}
            {!isWorkflow && (
              <span style={{ ...tagBadge, background: act.is_optional ? "#fff8e8" : "#edf8ed", color: act.is_optional ? "#b8860b" : "var(--color-accent-positive)" }}>
                {act.is_optional ? "Опциональная" : "Обязательная"}
              </span>
            )}
          </div>
        </div>
        {canEdit && dirty && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push(`/processes/edit/processes/${processId}`)} style={cancelBtn}>Отмена</button>
            <button onClick={handleSave} disabled={saving} style={saveBtn}>{saving ? "Сохранение…" : "Сохранить"}</button>
          </div>
        )}
      </div>

      {saveError && (
        <div style={{ marginBottom: "16px", padding: "10px 16px", background: "#fef2f2", borderRadius: "var(--radius-m)", color: "var(--color-accent-negative)", fontFamily: "MTS Compact", fontSize: "13px" }}>
          {saveError}
        </div>
      )}

      {/* Basic fields */}
      <div style={card}>
        <h2 style={{ fontFamily: "MTS Wide", fontSize: "16px", fontWeight: 700, margin: "0 0 20px" }}>Основное</h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Название *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} style={inp} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={lbl}>Описание</label>
          <textarea value={description} onChange={(e) => { setDescription(e.target.value); setDirty(true); }} style={textarea} />
        </div>

        <div style={row}>
          {!isWorkflow && (
            <div>
              <label style={lbl}>Статус обязательности</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "MTS Compact", fontSize: "14px" }}>
                <input type="checkbox" checked={isOptional} onChange={(e) => { setIsOptional(e.target.checked); setDirty(true); }} style={{ accentColor: "var(--brand-blue)", width: "16px", height: "16px" }} />
                Опциональная активность
              </label>
            </div>
          )}
          {isWorkflow && (
            <div>
              <label style={lbl}>Тип активности</label>
              <select value={activityType} onChange={(e) => { setActivityType(e.target.value as PmActivityType | ""); setDirty(true); }} style={select}>
                <option value="">— не указан —</option>
                <option value="manual">Ручная</option>
                <option value="system">Системная</option>
                <option value="decision">Решение / Ветвление</option>
              </select>
            </div>
          )}
          <div>
            <label style={lbl}>Условие / Когда выполняется</label>
            <input value={conditionNote} onChange={(e) => { setConditionNote(e.target.value); setDirty(true); }} placeholder="Например: если договор >10 млн руб." style={inp} />
          </div>
        </div>

        <div style={{ ...row, marginTop: "16px" }}>
          <div>
            <label style={lbl}>Продолжительность</label>
            <input value={duration} onChange={(e) => { setDuration(e.target.value); setDirty(true); }} placeholder="Например: 30 мин, 1–2 часа" style={inp} />
          </div>
          <div>
            <label style={lbl}>Потенциал автоматизации (0–100)</label>
            <input type="number" min={0} max={100} value={automationPotential} onChange={(e) => { setAutomationPotential(e.target.value); setDirty(true); }} placeholder="0" style={inp} />
          </div>
        </div>
      </div>

      {/* Workflow-specific: Data Operations */}
      {isWorkflow && (
        <div style={card}>
          <h2 style={{ fontFamily: "MTS Wide", fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Операции с данными</h2>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>
            Что читается / создаётся / изменяется в системах в рамках этой активности
          </p>
          <DataOpsEditor
            items={dataOperations}
            onChange={(v) => { setDataOperations(v); setDirty(true); }}
            readOnly={!canEdit}
          />
        </div>
      )}

      {/* Workflow-specific: Decision Logic (only for decision type) */}
      {isWorkflow && activityType === "decision" && (
        <div style={card}>
          <h2 style={{ fontFamily: "MTS Wide", fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Ветви решения</h2>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>
            Условие → Результат / следующий шаг
          </p>
          <DecisionEditor
            items={decisionLogic}
            onChange={(v) => { setDecisionLogic(v); setDirty(true); }}
            readOnly={!canEdit}
          />
        </div>
      )}

      {/* Service-specific: Phase + Quality criteria */}
      {!isWorkflow && (
        <div style={card}>
          <h2 style={{ fontFamily: "MTS Wide", fontSize: "16px", fontWeight: 700, margin: "0 0 20px" }}>Параметры услуги</h2>
          <div style={{ ...row, marginBottom: "16px" }}>
            <div>
              <label style={lbl}>Номер фазы</label>
              <input type="number" min={1} value={phaseNumber} onChange={(e) => { setPhaseNumber(e.target.value); setDirty(true); }} placeholder="1" style={inp} />
            </div>
          </div>
          <label style={lbl}>Критерии качества</label>
          <StringListEditor
            items={qualityCriteria}
            onChange={(v) => { setQualityCriteria(v); setDirty(true); }}
            placeholder="Добавить критерий..."
            readOnly={!canEdit}
          />
        </div>
      )}

      {/* SOPs (L5) */}
      <div style={card}>
        <h2 style={{ fontFamily: "MTS Wide", fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>СОПы (L5)</h2>
        <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>
          Стандартные операционные процедуры для данной активности
        </p>
        {sopsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}><Spinner size={24} /></div>
        ) : (
          <SopsSection
            processId={processId}
            activityId={activityId}
            sops={sops ?? []}
            canEdit={canEdit}
            router={router}
          />
        )}
      </div>

      {/* Save bar */}
      {canEdit && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
          <button onClick={() => router.push(`/processes/edit/processes/${processId}`)} style={cancelBtn}>← Назад к процессу</button>
          <button onClick={handleSave} disabled={saving || !dirty} style={{ ...saveBtn, opacity: !dirty ? 0.5 : 1 }}>
            {saving ? "Сохранение…" : "Сохранить изменения"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SOPs section ──────────────────────────────────────────────────────────────

function SopsSection({
  processId,
  activityId,
  sops,
  canEdit,
  router,
}: {
  processId: string;
  activityId: string;
  sops: import("@/lib/api/processes").PmSop[];
  canEdit: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const createSop = useCreateSop(processId, activityId);
  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const nextSopId = () => {
    if (sops.length === 0) return `${activityId}.S1`;
    const nums = sops.map(s => { const m = s.id.match(/\.S(\d+)$/); return m ? parseInt(m[1], 10) : 0; });
    return `${activityId}.S${Math.max(...nums) + 1}`;
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) { setAddError("Введите название СОПа"); return; }
    setAddError(null);
    try {
      await createSop.mutateAsync({
        id: nextSopId(),
        parent_activity_id: activityId,
        title: newTitle.trim(),
      });
      setNewTitle("");
    } catch (err) {
      setAddError((err as Error)?.message ?? "Ошибка создания");
    }
  };

  return (
    <div>
      {sops.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>СОПов пока нет</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
          {sops.map((sop) => (
            <SopRow
              key={sop.id}
              sop={sop}
              processId={processId}
              activityId={activityId}
              canEdit={canEdit}
              onEdit={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}/sops/${sop.id}`)}
            />
          ))}
        </div>
      )}
      {canEdit && (
        <div>
          <label style={{ ...lbl, marginBottom: "8px" }}>Добавить СОП</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              placeholder="Название СОПа..."
              style={{ ...inp, flex: 1 }}
            />
            <button onClick={handleAdd} disabled={createSop.isPending} style={saveBtn}>
              {createSop.isPending ? "…" : "+ Добавить"}
            </button>
          </div>
          <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
            ID: {nextSopId()}
          </p>
          {addError && <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)", marginTop: "4px" }}>{addError}</p>}
        </div>
      )}
    </div>
  );
}

function SopRow({
  sop,
  processId,
  activityId,
  canEdit,
  onEdit,
}: {
  sop: import("@/lib/api/processes").PmSop;
  processId: string;
  activityId: string;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const del = useDeleteSop(processId, activityId, sop.id);
  const [confirming, setConfirming] = useState(false);
  const stepsCount = sop.steps?.length ?? 0;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 12px",
      background: "var(--color-background-secondary)",
      borderRadius: "var(--radius-m)",
      border: "1px solid var(--color-background-lower)",
    }}>
      <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, color: "var(--color-text-primary)" }}>{sop.title}</span>
      {stepsCount > 0 && (
        <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
          {stepsCount} шаг{stepsCount === 1 ? "" : stepsCount < 5 ? "а" : "ов"}
        </span>
      )}
      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{sop.id}</span>
      {canEdit && (
        <>
          <button onClick={onEdit} style={{ ...removeBtn, color: "var(--brand-blue)" }}>Изм.</button>
          {confirming ? (
            <>
              <button onClick={async () => { try { await del.mutateAsync(); } catch (e) { alert((e as Error).message); setConfirming(false); } }} style={{ ...removeBtn, color: "var(--color-accent-negative)" }}>Удалить</button>
              <button onClick={() => setConfirming(false)} style={removeBtn}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setConfirming(true)} style={removeBtn}>✕</button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Data Operations editor ────────────────────────────────────────────────────

function DataOpsEditor({
  items,
  onChange,
  readOnly,
}: {
  items: PmDataOperation[];
  onChange: (v: PmDataOperation[]) => void;
  readOnly: boolean;
}) {
  const [newData, setNewData] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newOp, setNewOp] = useState<"read" | "create">("read");

  const add = () => {
    if (!newData.trim()) return;
    onChange([...items, { operation: newOp, data: newData.trim(), source_target: newSource.trim() }]);
    setNewData("");
    setNewSource("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const OP_COLORS: Record<string, { bg: string; color: string }> = {
    read: { bg: "#e8f0fe", color: "#1a73e8" },
    create: { bg: "#edf8ed", color: "#2e7d32" },
  };

  return (
    <div>
      {items.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>Не указано</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
          {items.map((item, i) => {
            const colors = OP_COLORS[item.operation] ?? OP_COLORS.read;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-s)" }}>
                <span style={{ padding: "1px 6px", borderRadius: "var(--radius-s)", fontSize: "11px", fontFamily: "MTS Compact", fontWeight: 500, background: colors.bg, color: colors.color, flexShrink: 0 }}>
                  {item.operation === "read" ? "Чтение" : "Создание"}
                </span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{item.data}</span>
                {item.source_target && (
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>{item.source_target}</span>
                )}
                {!readOnly && (
                  <button onClick={() => remove(i)} style={{ ...removeBtn, padding: "0 4px" }}>✕</button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!readOnly && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <select value={newOp} onChange={(e) => setNewOp(e.target.value as "read" | "create")} style={{ ...select, width: "120px", flex: "none" }}>
            <option value="read">Чтение</option>
            <option value="create">Создание</option>
          </select>
          <input value={newData} onChange={(e) => setNewData(e.target.value)} placeholder="Объект / документ..." style={{ ...inp, flex: 2, minWidth: "120px" }} />
          <input value={newSource} onChange={(e) => setNewSource(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Источник / цель..." style={{ ...inp, flex: 1, minWidth: "100px" }} />
          <button onClick={add} style={{ ...saveBtn, padding: "10px 14px", whiteSpace: "nowrap" }}>+ Добавить</button>
        </div>
      )}
    </div>
  );
}

// ─── Decision Logic editor ─────────────────────────────────────────────────────

function DecisionEditor({
  items,
  onChange,
  readOnly,
}: {
  items: PmDecisionBranch[];
  onChange: (v: PmDecisionBranch[]) => void;
  readOnly: boolean;
}) {
  const [newQ, setNewQ] = useState("");
  const [newYes, setNewYes] = useState("");
  const [newNo, setNewNo] = useState("");

  const add = () => {
    if (!newQ.trim()) return;
    onChange([...items, { question: newQ.trim(), branch_yes: newYes.trim(), branch_no: newNo.trim() }]);
    setNewQ("");
    setNewYes("");
    setNewNo("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: "8px", padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", position: "relative" }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 6px" }}>❓ {item.question}</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "#2e7d32", margin: 0 }}>✅ Да: {item.branch_yes || "—"}</p>
            <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)", margin: 0 }}>❌ Нет: {item.branch_no || "—"}</p>
          </div>
          {!readOnly && (
            <button onClick={() => remove(i)} style={{ ...removeBtn, position: "absolute", top: "8px", right: "8px" }}>✕</button>
          )}
        </div>
      ))}
      {!readOnly && (
        <div style={{ padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", marginTop: "4px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={lbl}>Вопрос (условие)</label>
            <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Договор согласован?" style={inp} />
          </div>
          <div style={row}>
            <div>
              <label style={lbl}>Ветка «Да»</label>
              <input value={newYes} onChange={(e) => setNewYes(e.target.value)} placeholder="Следующий шаг если Да..." style={inp} />
            </div>
            <div>
              <label style={lbl}>Ветка «Нет»</label>
              <input value={newNo} onChange={(e) => setNewNo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Следующий шаг если Нет..." style={inp} />
            </div>
          </div>
          <button onClick={add} style={{ ...saveBtn, marginTop: "10px", padding: "8px 16px" }}>+ Добавить ветку</button>
        </div>
      )}
    </div>
  );
}

// ─── String list editor ────────────────────────────────────────────────────────

function StringListEditor({
  items,
  onChange,
  placeholder,
  readOnly,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  readOnly: boolean;
}) {
  const [newVal, setNewVal] = useState("");

  const add = () => {
    if (!newVal.trim()) return;
    onChange([...items, newVal.trim()]);
    setNewVal("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-s)", marginBottom: "4px" }}>
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{item}</span>
          {!readOnly && <button onClick={() => remove(i)} style={removeBtn}>✕</button>}
        </div>
      ))}
      {!readOnly && (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input value={newVal} onChange={(e) => setNewVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} style={{ ...inp, flex: 1 }} />
          <button onClick={add} style={{ ...saveBtn, padding: "10px 14px" }}>+</button>
        </div>
      )}
    </div>
  );
}
