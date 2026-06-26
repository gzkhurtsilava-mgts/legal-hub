"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import {
  useActivity,
  useSop,
  useUpdateSop,
  type PmSopStep,
  type PmSopFaq,
  type PmSopUpdate,
} from "@/lib/api/processes";

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
  minHeight: "70px",
  resize: "vertical",
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

const sectionTitle: React.CSSProperties = {
  fontFamily: "MTS Wide",
  fontSize: "16px",
  fontWeight: 700,
  margin: "0 0 6px",
};

const sectionHint: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "12px",
  color: "var(--color-text-tertiary)",
  margin: "0 0 16px",
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SopEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const processId = params.id as string;
  const activityId = params.activityId as string;
  const sopId = params.sopId as string;

  const { data: act } = useActivity(processId, activityId);
  const { data: sop, isLoading } = useSop(processId, activityId, sopId);
  const updateSop = useUpdateSop(processId, activityId, sopId);

  const canEdit = session?.user?.role === "admin" || session?.user?.role === "lawyer";

  // ── form state
  const [title, setTitle] = useState("");
  const [preconditions, setPreconditions] = useState<string[]>([]);
  const [steps, setSteps] = useState<PmSopStep[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [faq, setFaq] = useState<PmSopFaq[]>([]);
  const [relatedDocs, setRelatedDocs] = useState<Array<{ title: string; ref: string }>>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!sop) return;
    setTitle(sop.title ?? "");
    setPreconditions(sop.preconditions ?? []);
    setSteps(sop.steps ?? []);
    setChecklist(sop.checklist ?? []);
    setFaq(sop.faq ?? []);
    setRelatedDocs(sop.related_docs ?? []);
    setDirty(false);
  }, [sop]);

  const handleSave = async () => {
    if (!title.trim()) { setSaveError("Название обязательно"); return; }
    setSaveError(null);
    setSaving(true);
    try {
      const body: PmSopUpdate = {
        title: title.trim(),
        preconditions,
        steps,
        checklist,
        faq,
        related_docs: relatedDocs,
      };
      await updateSop.mutateAsync(body);
      setDirty(false);
    } catch (err) {
      setSaveError((err as Error)?.message ?? "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (!sop) {
    return <p style={{ padding: "40px", fontFamily: "MTS Compact" }}>СОП не найден</p>;
  }

  return (
    <div style={page}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => router.push("/processes/edit/processes")} style={removeBtn}>Процессы</button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>/</span>
        <button onClick={() => router.push(`/processes/edit/processes/${processId}`)} style={removeBtn}>Процесс</button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>/</span>
        <button onClick={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}`)} style={removeBtn}>
          {act?.name ?? activityId}
        </button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>/</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)" }}>
          СОП {sopId}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "MTS Wide", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>{sop.title}</h1>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{sopId}</span>
        </div>
        {canEdit && dirty && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}`)} style={cancelBtn}>Отмена</button>
            <button onClick={handleSave} disabled={saving} style={saveBtn}>{saving ? "Сохранение…" : "Сохранить"}</button>
          </div>
        )}
      </div>

      {saveError && (
        <div style={{ marginBottom: "16px", padding: "10px 16px", background: "#fef2f2", borderRadius: "var(--radius-m)", color: "var(--color-accent-negative)", fontFamily: "MTS Compact", fontSize: "13px" }}>
          {saveError}
        </div>
      )}

      {/* Title */}
      <div style={card}>
        <h2 style={sectionTitle}>Название</h2>
        <input value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} disabled={!canEdit} style={inp} />
      </div>

      {/* Preconditions */}
      <div style={card}>
        <h2 style={sectionTitle}>Предусловия</h2>
        <p style={sectionHint}>Что должно быть выполнено / получено до начала активности</p>
        <StringListEditor
          items={preconditions}
          onChange={(v) => { setPreconditions(v); setDirty(true); }}
          placeholder="Добавить предусловие..."
          readOnly={!canEdit}
        />
      </div>

      {/* Steps */}
      <div style={card}>
        <h2 style={sectionTitle}>Шаги выполнения</h2>
        <p style={sectionHint}>Пошаговая инструкция. Каждый шаг может иметь подшаги.</p>
        <StepsEditor
          steps={steps}
          onChange={(v) => { setSteps(v); setDirty(true); }}
          readOnly={!canEdit}
        />
      </div>

      {/* Checklist */}
      <div style={card}>
        <h2 style={sectionTitle}>Чеклист</h2>
        <p style={sectionHint}>Пункты для проверки после выполнения</p>
        <StringListEditor
          items={checklist}
          onChange={(v) => { setChecklist(v); setDirty(true); }}
          placeholder="Добавить пункт чеклиста..."
          readOnly={!canEdit}
        />
      </div>

      {/* FAQ */}
      <div style={card}>
        <h2 style={sectionTitle}>FAQ</h2>
        <p style={sectionHint}>Часто задаваемые вопросы и ответы</p>
        <FaqEditor
          items={faq}
          onChange={(v) => { setFaq(v); setDirty(true); }}
          readOnly={!canEdit}
        />
      </div>

      {/* Related docs */}
      <div style={card}>
        <h2 style={sectionTitle}>Связанные документы</h2>
        <p style={sectionHint}>Ссылки на шаблоны, регламенты, инструкции</p>
        <DocsEditor
          items={relatedDocs}
          onChange={(v) => { setRelatedDocs(v); setDirty(true); }}
          readOnly={!canEdit}
        />
      </div>

      {/* Save bar */}
      {canEdit && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
          <button onClick={() => router.push(`/processes/edit/processes/${processId}/activities/${activityId}`)} style={{ ...cancelBtn, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Icon name="ArrowLeftSize24StyleOutline" size={16} />Назад к активности
          </button>
          <button onClick={handleSave} disabled={saving || !dirty} style={{ ...saveBtn, opacity: !dirty ? 0.5 : 1 }}>
            {saving ? "Сохранение…" : "Сохранить изменения"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Steps editor ──────────────────────────────────────────────────────────────

function StepsEditor({
  steps,
  onChange,
  readOnly,
}: {
  steps: PmSopStep[];
  onChange: (v: PmSopStep[]) => void;
  readOnly: boolean;
}) {
  const [newTitle, setNewTitle] = useState("");

  const addStep = () => {
    if (!newTitle.trim()) return;
    onChange([...steps, { title: newTitle.trim(), substeps: [], tips: [], warnings: [] }]);
    setNewTitle("");
  };

  const removeStep = (idx: number) => onChange(steps.filter((_, i) => i !== idx));

  const addSubstep = (stepIdx: number, sub: string) => {
    if (!sub.trim()) return;
    const updated = steps.map((s, i) =>
      i === stepIdx ? { ...s, substeps: [...(s.substeps ?? []), sub.trim()] } : s
    );
    onChange(updated);
  };

  const removeSubstep = (stepIdx: number, subIdx: number) => {
    const updated = steps.map((s, i) =>
      i === stepIdx ? { ...s, substeps: (s.substeps ?? []).filter((_, j) => j !== subIdx) } : s
    );
    onChange(updated);
  };

  return (
    <div>
      {steps.map((step, stepIdx) => (
        <StepItem
          key={stepIdx}
          step={step}
          stepIdx={stepIdx}
          readOnly={readOnly}
          onRemove={() => removeStep(stepIdx)}
          onAddSubstep={(sub) => addSubstep(stepIdx, sub)}
          onRemoveSubstep={(subIdx) => removeSubstep(stepIdx, subIdx)}
        />
      ))}
      {!readOnly && (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStep(); } }}
            placeholder="Название нового шага..."
            style={{ ...inp, flex: 1 }}
          />
          <button onClick={addStep} style={{ ...saveBtn, padding: "10px 14px" }}>+ Шаг</button>
        </div>
      )}
    </div>
  );
}

function StepItem({
  step,
  stepIdx,
  readOnly,
  onRemove,
  onAddSubstep,
  onRemoveSubstep,
}: {
  step: PmSopStep;
  stepIdx: number;
  readOnly: boolean;
  onRemove: () => void;
  onAddSubstep: (sub: string) => void;
  onRemoveSubstep: (subIdx: number) => void;
}) {
  const [newSub, setNewSub] = useState("");

  return (
    <div style={{ marginBottom: "12px", padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontFamily: "MTS Wide", fontSize: "13px", fontWeight: 700, color: "var(--brand-blue)", minWidth: "20px" }}>
          {stepIdx + 1}.
        </span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", flex: 1, fontWeight: 500 }}>
          {step.title}
        </span>
        {!readOnly && <button onClick={onRemove} style={removeBtn}><Icon name="CrossSize16StyleOutline" size={14} /></button>}
      </div>

      {(step.substeps ?? []).map((sub, subIdx) => (
        <div key={subIdx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0 4px 28px" }}>
          <span style={{ color: "var(--color-text-tertiary)", fontSize: "12px" }}>•</span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", flex: 1 }}>{sub}</span>
          {!readOnly && <button onClick={() => onRemoveSubstep(subIdx)} style={removeBtn}><Icon name="CrossSize16StyleOutline" size={14} /></button>}
        </div>
      ))}

      {!readOnly && (
        <div style={{ display: "flex", gap: "6px", marginTop: "6px", paddingLeft: "28px" }}>
          <input
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddSubstep(newSub); setNewSub(""); } }}
            placeholder="Подшаг..."
            style={{ ...inp, fontSize: "12px", padding: "6px 10px", flex: 1 }}
          />
          <button onClick={() => { onAddSubstep(newSub); setNewSub(""); }} style={{ ...saveBtn, padding: "6px 10px", fontSize: "12px" }}>+</button>
        </div>
      )}
    </div>
  );
}

// ─── FAQ editor ────────────────────────────────────────────────────────────────

function FaqEditor({
  items,
  onChange,
  readOnly,
}: {
  items: PmSopFaq[];
  onChange: (v: PmSopFaq[]) => void;
  readOnly: boolean;
}) {
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const add = () => {
    if (!newQ.trim()) return;
    onChange([...items, { question: newQ.trim(), answer: newA.trim() }]);
    setNewQ("");
    setNewA("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: "10px", padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Q: {item.question}</p>
            {!readOnly && <button onClick={() => remove(i)} style={removeBtn}><Icon name="CrossSize16StyleOutline" size={14} /></button>}
          </div>
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>A: {item.answer || "—"}</p>
        </div>
      ))}
      {!readOnly && (
        <div style={{ padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", marginTop: "4px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={lbl}>Вопрос</label>
            <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Вопрос..." style={inp} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={lbl}>Ответ</label>
            <textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Ответ..." style={textarea} />
          </div>
          <button onClick={add} style={{ ...saveBtn, padding: "8px 16px" }}>+ Добавить FAQ</button>
        </div>
      )}
    </div>
  );
}

// ─── Related docs editor ───────────────────────────────────────────────────────

function DocsEditor({
  items,
  onChange,
  readOnly,
}: {
  items: Array<{ title: string; ref: string }>;
  onChange: (v: Array<{ title: string; ref: string }>) => void;
  readOnly: boolean;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [newRef, setNewRef] = useState("");

  const add = () => {
    if (!newTitle.trim()) return;
    onChange([...items, { title: newTitle.trim(), ref: newRef.trim() }]);
    setNewTitle("");
    setNewRef("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", marginBottom: "4px" }}>
          <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", flex: 1 }}>{item.title}</span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{item.ref}</span>
          {!readOnly && <button onClick={() => remove(i)} style={removeBtn}><Icon name="CrossSize16StyleOutline" size={14} /></button>}
        </div>
      ))}
      {!readOnly && (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Название документа..." style={{ ...inp, flex: 2 }} />
          <input value={newRef} onChange={(e) => setNewRef(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Ссылка / артикул..." style={{ ...inp, flex: 1 }} />
          <button onClick={add} style={{ ...saveBtn, padding: "10px 14px", whiteSpace: "nowrap" }}>+ Добавить</button>
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
          {!readOnly && <button onClick={() => remove(i)} style={removeBtn}><Icon name="CrossSize16StyleOutline" size={14} /></button>}
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
