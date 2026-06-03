"use client";

import { useRef, useState } from "react";
import { useDocumentVersions, useUploadVersion, useDeleteVersion, useUploadSlidesZip } from "@/lib/api/knowledge";
import type { DocumentVersion } from "@/lib/api/knowledge";

function formatBytes(b: number) {
  if (b < 1048576) return `${(b / 1024).toFixed(0)} КБ`;
  return `${(b / 1048576).toFixed(1)} МБ`;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "В очереди", processing: "Обработка…", ready: "Готово", failed: "Ошибка", na: "Слайды нужны",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "var(--color-text-tertiary)", processing: "var(--color-accent-warning)",
  ready: "var(--color-accent-positive)", failed: "var(--color-accent-negative)", na: "var(--brand-blue)",
};

function isPptx(v: DocumentVersion) {
  return v.original_mime_type.includes("presentationml") || v.original_mime_type.includes("powerpoint");
}

export function VersionUpload({ itemId }: { itemId: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const slidesRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [slidesVersionId, setSlidesVersionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: versions = [], isLoading } = useDocumentVersions(itemId);
  const upload = useUploadVersion(itemId);
  const remove = useDeleteVersion(itemId);
  const uploadSlides = useUploadSlidesZip(itemId, slidesVersionId ?? 0);

  const handleUpload = async (file: File) => {
    setError("");
    if (!label.trim()) { setError("Введите метку версии"); return; }
    try {
      await upload.mutateAsync({ file, versionLabel: label.trim(), notes: notes.trim() || undefined });
      setLabel("");
      setNotes("");
    } catch {
      setError("Ошибка загрузки файла");
    }
  };

  const handleSlidesUpload = async (file: File) => {
    if (!slidesVersionId) return;
    await uploadSlides.mutateAsync(file);
    setSlidesVersionId(null);
  };

  return (
    <div>
      {/* Existing versions */}
      {isLoading ? (
        <p style={smallText}>Загрузка версий…</p>
      ) : versions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {versions.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
                  {v.version_label}
                </p>
                <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>
                  {v.original_filename} · {formatBytes(v.file_size)}
                </p>
              </div>
              <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: STATUS_COLOR[v.preview_status], fontWeight: 500 }}>
                {STATUS_LABEL[v.preview_status]}
              </span>

              {/* ZIP slides upload for PPTX */}
              {isPptx(v) && (
                <>
                  <button
                    onClick={() => { setSlidesVersionId(v.id); slidesRef.current?.click(); }}
                    style={smallBtn}
                    disabled={uploadSlides.isPending}
                  >
                    {uploadSlides.isPending && slidesVersionId === v.id ? "Загрузка…" : "📁 ZIP слайдов"}
                  </button>
                  <input
                    ref={slidesRef}
                    type="file"
                    accept=".zip,application/zip"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSlidesUpload(f); e.target.value = ""; }}
                  />
                </>
              )}

              <a href={`/api/files/${v.original_file_path}`} download={v.original_filename} style={smallLink}>⬇</a>
              <button onClick={() => remove.mutate(v.id)} disabled={remove.isPending} style={deleteBtn}>✕</button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ ...smallText, marginBottom: "16px" }}>Версий пока нет</p>
      )}

      {/* Upload new version */}
      <div style={{ border: "1.5px dashed var(--color-background-secondary)", borderRadius: "var(--radius-m)", padding: "16px" }}>
        <p style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "12px" }}>
          Загрузить новую версию
        </p>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Метка версии (напр. «v2.0» или «2025-06-01»)"
            style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Примечание (необязательно)"
            style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
          />
        </div>
        {error && <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-accent-negative)", marginBottom: "8px" }}>{error}</p>}
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", background: "var(--brand-blue)", color: "#fff", borderRadius: "var(--radius-l)", cursor: upload.isPending ? "default" : "pointer", fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, opacity: upload.isPending ? 0.7 : 1 }}>
          {upload.isPending ? "Загрузка…" : "+ Выбрать файл"}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            style={{ display: "none" }}
            disabled={upload.isPending}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
          />
        </label>
        <p style={{ ...smallText, marginTop: "8px" }}>PDF, Word, Excel, PowerPoint · до 100 МБ</p>
      </div>
    </div>
  );
}

const smallText: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", fontFamily: "MTS Compact", fontSize: "13px", background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none" };
const smallBtn: React.CSSProperties = { padding: "4px 10px", border: "1px solid var(--brand-blue)", borderRadius: "var(--radius-l)", background: "transparent", color: "var(--brand-blue)", fontFamily: "MTS Compact", fontSize: "12px", cursor: "pointer" };
const smallLink: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", textDecoration: "none" };
const deleteBtn: React.CSSProperties = { padding: "2px 8px", border: "none", borderRadius: "var(--radius-s)", background: "transparent", color: "var(--color-text-tertiary)", cursor: "pointer", fontSize: "14px" };
