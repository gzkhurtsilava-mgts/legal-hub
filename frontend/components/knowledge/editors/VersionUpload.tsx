"use client";

import { useRef, useState } from "react";
import {
  useDocumentVersions, useUploadVersion, useDeleteVersion,
  useUploadSlidesZip, useUpdateVersionMeta, useSetCurrentVersion,
  useReplaceVersionPdf, useReplaceVersionSource,
} from "@/lib/api/knowledge";
import type { DocumentVersion } from "@/lib/api/knowledge";
import { apiFetchForm } from "@/lib/api/client";
import { ConfirmModal } from "./ConfirmModal";
import { Icon } from "@/components/icons";

function formatBytes(b: number) {
  if (b < 1048576) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1048576).toFixed(1)} МБ`;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "В очереди", processing: "Обработка…", failed: "Ошибка конвертации", na: "Нужны слайды",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "var(--color-text-tertiary)", processing: "var(--color-accent-warning)",
  failed: "var(--color-accent-negative)", na: "var(--brand-blue)",
};

function isPptx(v: DocumentVersion) {
  return v.original_mime_type.includes("presentationml") || v.original_mime_type.includes("powerpoint");
}

function getPdfInfo(v: DocumentVersion): { path: string; label: string } | null {
  const pd = v.preview_data as Record<string, string> | null;
  if (!pd) return null;
  if (pd.type === "pdf") {
    return { path: pd.path ?? v.original_file_path, label: "PDF-превью" };
  }
  return null;
}

// ─── Single version row ───────────────────────────────────────────────────────

function VersionRow({
  v,
  itemId,
  onSetCurrent,
  isSettingCurrent,
  token,
}: {
  v: DocumentVersion;
  itemId: number;
  onSetCurrent: (id: number) => void;
  isSettingCurrent: boolean;
  token?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState(v.version_label);
  const [notes, setNotes] = useState(v.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const pdfRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const slidesRef = useRef<HTMLInputElement>(null);

  const remove = useDeleteVersion(itemId);
  const updateMeta = useUpdateVersionMeta(itemId, v.id);
  const replacePdf = useReplaceVersionPdf(itemId, v.id);
  const replaceSource = useReplaceVersionSource(itemId, v.id);
  const uploadSlides = useUploadSlidesZip(itemId, v.id);

  const pdfInfo = getPdfInfo(v);

  const handleSaveMeta = async () => {
    await updateMeta.mutateAsync({
      version_label: label.trim(),
      notes: notes.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const deleteMessage = v.is_current
    ? `Версия «${v.version_label}» является актуальной и будет удалена безвозвратно. Следующей действующей версией станет предшествующая текущей.`
    : `Это приведёт к безвозвратному удалению версии «${v.version_label}».`;

  const deleteTitle = `Удалить версию «${v.version_label}»?`;

  const withToken = (path: string) =>
    token ? `/api/files/${path}?token=${encodeURIComponent(token)}` : `/api/files/${path}`;

  return (
    <>
      {deleteConfirm && (
        <ConfirmModal
          title={deleteTitle}
          message={deleteMessage}
          onConfirm={() => { setDeleteConfirm(false); remove.mutate(v.id); }}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}

      <div style={{ border: "1.5px solid", borderColor: v.is_current ? "var(--brand-blue)" : "var(--color-background-secondary)", borderRadius: "var(--radius-m)", overflow: "hidden" }}>
        {/* Row header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: v.is_current ? "var(--brand-blue-tint)" : "var(--color-background-secondary)", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {v.is_current && (
                <span style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 600, color: "var(--color-accent-positive)", background: "var(--color-background-positive-soft)", padding: "1px 8px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                  актуальная
                </span>
              )}
              <span style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 600, color: v.is_current ? "var(--brand-blue)" : "var(--color-text-primary)" }}>
                {v.version_label}
              </span>
            </div>
            <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>
              {v.original_filename} · {formatBytes(v.file_size)}
            </p>
          </div>

          {/* Status — only non-ready states */}
          {v.preview_status !== "ready" && (
            <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: STATUS_COLOR[v.preview_status], fontWeight: 500, whiteSpace: "nowrap" }}>
              {STATUS_LABEL[v.preview_status]}
            </span>
          )}

          {!v.is_current && (
            <button
              onClick={() => onSetCurrent(v.id)}
              disabled={isSettingCurrent}
              style={{ ...smallBtn, borderColor: "var(--color-accent-positive)", color: "var(--color-accent-positive)" }}
            >
              Сделать актуальной
            </button>
          )}

          <button onClick={() => setExpanded((e) => !e)} style={smallBtn}>
            {expanded ? "Свернуть" : "Изменить"}
          </button>

          <button onClick={() => setDeleteConfirm(true)} disabled={remove.isPending} style={{ ...deleteBtn, display: "flex", alignItems: "center" }} title="Удалить версию"><Icon name="CrossSize16StyleOutline" size={14} /></button>
        </div>

        {/* Expanded editor */}
        {expanded && (
          <div style={{ padding: "16px", background: "var(--color-background-primary)", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--color-background-secondary)" }}>
            {/* Meta fields */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "180px" }}>
                <label style={editLabel}>Название редакции</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} style={editInput} />
              </div>
              <div style={{ flex: "100%", minWidth: 0 }}>
                <label style={editLabel}>Примечание</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Необязательно" style={editInput} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={handleSaveMeta} disabled={updateMeta.isPending || !label.trim()} style={{ ...primaryBtn, fontSize: "13px", padding: "7px 18px" }}>
                {updateMeta.isPending ? "…" : "Сохранить"}
              </button>
              {saved && <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-positive)" }}><Icon name="CheckCircleSize24StyleOutline" size={15} />Сохранено</span>}
            </div>

            {/* Current files */}
            <div style={{ borderTop: "1px solid var(--color-background-secondary)", paddingTop: "14px" }}>
              <p style={sectionLabel}>Файлы</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Primary PDF */}
                <div style={fileRow}>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, color: "var(--color-text-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Icon name="DocumentSize24StyleOutline" size={16} style={{ flexShrink: 0, color: "var(--color-text-secondary)" }} />
                    Основной документ (PDF)
                    {pdfInfo && <span style={{ color: "var(--color-text-tertiary)" }}>· {v.original_filename}</span>}
                  </span>
                  {pdfInfo && <a href={withToken(pdfInfo.path)} download={v.original_filename} style={fileAction}>Скачать</a>}
                  <label style={{ ...fileAction, cursor: "pointer" }}>
                    {replacePdf.isPending ? "Загрузка…" : (pdfInfo ? "Заменить" : "Загрузить")}
                    <input ref={pdfRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
                      disabled={replacePdf.isPending}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) replacePdf.mutate(f); e.target.value = ""; }} />
                  </label>
                </div>

                {/* Source file (optional) */}
                <div style={fileRow}>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, color: v.source_filename ? "var(--color-text-primary)" : "var(--color-text-tertiary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Icon name="DocumentSize24StyleOutline" size={16} style={{ flexShrink: 0, color: "var(--color-text-secondary)" }} />
                    {v.source_filename
                      ? <>Исходный файл <span style={{ color: "var(--color-text-tertiary)" }}>· {v.source_filename}{v.source_file_size ? ` (${formatBytes(v.source_file_size)})` : ""}</span></>
                      : "Исходный файл не загружен (необязательно)"}
                  </span>
                  {v.source_file_path && <a href={withToken(v.source_file_path)} download={v.source_filename ?? undefined} style={fileAction}>Скачать</a>}
                  <label style={{ ...fileAction, cursor: "pointer" }}>
                    {replaceSource.isPending ? "Загрузка…" : (v.source_filename ? "Заменить" : "Загрузить")}
                    <input ref={sourceRef} type="file" accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx" style={{ display: "none" }}
                      disabled={replaceSource.isPending}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceSource.mutate(f); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VersionUpload({ itemId, token }: { itemId: number; token?: string }) {
  const pdfRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: versions = [], isLoading } = useDocumentVersions(itemId);
  const upload = useUploadVersion(itemId);
  const setCurrent = useSetCurrentVersion(itemId);

  const handleUpload = async () => {
    setError("");
    if (!label.trim()) { setError("Введите название редакции"); return; }
    if (!pdfFile) { setError("Выберите PDF-файл"); return; }
    setUploading(true);
    try {
      await upload.mutateAsync({
        pdfFile: pdfFile!,
        sourceFile: sourceFile,
        versionLabel: label.trim(),
        notes: notes.trim() || undefined,
      });
      setLabel(""); setNotes(""); setPdfFile(null); setSourceFile(null);
      if (pdfRef.current) pdfRef.current.value = "";
      if (sourceRef.current) sourceRef.current.value = "";
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const canUpload = !!pdfFile && !uploading;

  return (
    <div>
      {isLoading ? (
        <p style={smallText}>Загрузка версий…</p>
      ) : versions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {versions.map((v) => (
            <VersionRow
              key={v.id}
              v={v}
              itemId={itemId}
              token={token}
              onSetCurrent={(id) => setCurrent.mutate(id)}
              isSettingCurrent={setCurrent.isPending}
            />
          ))}
        </div>
      ) : (
        <p style={{ ...smallText, marginBottom: "16px" }}>Версий пока нет</p>
      )}

      {/* ── New version form ── */}
      <div style={{ border: "1.5px dashed var(--color-background-secondary)", borderRadius: "var(--radius-m)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
          Загрузить новую редакцию
        </p>

        {/* Name + notes */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={label}
            onChange={(e) => { setLabel(e.target.value); if (error === "Введите название редакции") setError(""); }}
            placeholder="Название (напр. «Ред. 3» или «01.06.2025») *"
            style={{ ...inputStyle, flex: 1, minWidth: "180px", borderColor: error === "Введите название редакции" ? "var(--color-accent-negative)" : "var(--color-background-secondary)" }}
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Примечание (необязательно)"
            style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
          />
        </div>

        {/* Files */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* PDF — required */}
          <div style={fileRow}>
            <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, color: pdfFile ? "var(--color-text-primary)" : "var(--color-text-tertiary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="DocumentSize24StyleOutline" size={16} style={{ flexShrink: 0, color: "var(--color-text-secondary)" }} />
              {pdfFile ? `${pdfFile.name} (${formatBytes(pdfFile.size)})` : "Основной документ (PDF) не выбран"}
            </span>
            <label style={{ ...fileAction, cursor: "pointer", color: "var(--brand-blue)" }}>
              {pdfFile ? "Изменить" : "Выбрать"}
              <input ref={pdfRef} type="file" accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => { setPdfFile(e.target.files?.[0] ?? null); }}
              />
            </label>
          </div>

          {/* Source file — optional */}
          <div style={fileRow}>
            <span style={{ fontFamily: "MTS Compact", fontSize: "13px", flex: 1, color: sourceFile ? "var(--color-text-primary)" : "var(--color-text-tertiary)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="DocumentSize24StyleOutline" size={16} style={{ flexShrink: 0, color: "var(--color-text-secondary)" }} />
              {sourceFile ? `${sourceFile.name} (${formatBytes(sourceFile.size)})` : "Исходный файл (необязательно)"}
            </span>
            {sourceFile && (
              <button onClick={() => { setSourceFile(null); if (sourceRef.current) sourceRef.current.value = ""; }}
                style={{ ...fileAction, color: "var(--color-text-tertiary)" }}>
                Убрать
              </button>
            )}
            <label style={{ ...fileAction, cursor: "pointer" }}>
              {sourceFile ? "Изменить" : "Выбрать"}
              <input ref={sourceRef} type="file" accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx"
                style={{ display: "none" }}
                onChange={(e) => { setSourceFile(e.target.files?.[0] ?? null); }}
              />
            </label>
          </div>
        </div>

        {error && <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)", margin: 0 }}>{error}</p>}

        <button
          onClick={handleUpload}
          disabled={!canUpload}
          style={{ ...primaryBtn, alignSelf: "flex-start", opacity: canUpload ? 1 : 0.5, cursor: canUpload ? "pointer" : "default" }}
        >
          {uploading ? "Загрузка…" : "Загрузить редакцию"}
        </button>
      </div>
    </div>
  );
}

const smallText: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", fontFamily: "MTS Compact", fontSize: "13px", background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none" };
const smallBtn: React.CSSProperties = { padding: "4px 10px", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-l)", background: "transparent", color: "var(--color-text-secondary)", fontFamily: "MTS Compact", fontSize: "12px", cursor: "pointer" };
const deleteBtn: React.CSSProperties = { padding: "2px 8px", border: "none", borderRadius: "var(--radius-s)", background: "transparent", color: "var(--color-text-tertiary)", cursor: "pointer", fontSize: "14px" };
const editLabel: React.CSSProperties = { display: "block", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px" };
const editInput: React.CSSProperties = { width: "100%", padding: "7px 10px", border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", fontFamily: "MTS Compact", fontSize: "13px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const sectionLabel: React.CSSProperties = { fontFamily: "MTS Wide", fontWeight: 700, fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" };
const fileRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" };
const fileAction: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "12px", color: "var(--brand-blue)", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" };
