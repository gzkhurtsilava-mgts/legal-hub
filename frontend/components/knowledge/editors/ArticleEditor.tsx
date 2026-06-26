"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ResizableImage } from "@/components/knowledge/ResizableImage";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { Typography } from "@tiptap/extension-typography";
import { useUploadMedia } from "@/lib/api/knowledge";
import type { AttachmentMeta } from "@/lib/api/knowledge";
import { FileEmbedExtension } from "@/components/knowledge/editors/FileEmbedExtension";
import { Icon } from "@/components/icons";

interface TocItem { id: string; level: number; textContent: string; }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolBtn({
  active = false, onClick, title, children, disabled = false,
}: {
  active?: boolean; onClick: () => void; title: string;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button" title={title} onClick={onClick} disabled={disabled}
      className={active ? "ui-toolbtn is-active" : "ui-toolbtn"}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: "1px", height: "20px", background: "var(--color-background-secondary)", margin: "0 2px", flexShrink: 0 }} />;
}

// ─── ToC panel ────────────────────────────────────────────────────────────────

function TocPanel({ items }: { items: TocItem[] }) {
  if (!items.length) {
    return <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", padding: "12px 16px", borderTop: "1px solid var(--color-background-secondary)" }}>Заголовки не найдены</p>;
  }
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-background-secondary)", background: "var(--color-background-primary)" }}>
      <p style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Содержание</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 14}px` }}>
            <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>{item.textContent || "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function ArticleEditor({
  initialContent,
  tocEnabled = false,
  attachments = [],
  onSave,
  onChange,
  isSaving = false,
}: {
  initialContent?: Record<string, unknown> | null;
  tocEnabled?: boolean;
  attachments?: AttachmentMeta[];
  onSave: (content: Record<string, unknown>, tocEnabled: boolean) => void;
  onChange?: (content: Record<string, unknown>, tocEnabled: boolean) => void;
  isSaving?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const filePickerRef = useRef<HTMLDivElement>(null);
  const uploadMedia = useUploadMedia();
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);

  useEffect(() => {
    if (!showFilePicker) return;
    function handleOutside(e: MouseEvent) {
      if (filePickerRef.current && !filePickerRef.current.contains(e.target as Node)) {
        setShowFilePicker(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showFilePicker]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Superscript,
      Subscript,
      Typography,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Начните вводить текст статьи…" }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      TableOfContents.configure({ onUpdate(content: TocItem[]) { setTocItems(content); } }),
      Details.configure({ persist: true, HTMLAttributes: { class: "tiptap-details" } }),
      DetailsSummary,
      DetailsContent,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      FileEmbedExtension.configure({ editable: true }),
    ],
    content: initialContent ?? undefined,
    editorProps: { attributes: { spellcheck: "true", class: "tiptap-editable" } },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON() as Record<string, unknown>, tocEnabled);
    },
  });

  // Когда список вложений сокращается (файл удалён) — убираем stale fileEmbed-узлы из редактора
  useEffect(() => {
    if (!editor) return;
    const validPaths = new Set(attachments.map((a) => a.path));
    const toDelete: { from: number; to: number }[] = [];
    editor.state.doc.forEach((node, pos) => {
      if (node.type.name === "fileEmbed" && !validPaths.has(node.attrs.path as string)) {
        toDelete.push({ from: pos, to: pos + node.nodeSize });
      }
    });
    if (!toDelete.length) return;
    const tr = editor.state.tr;
    [...toDelete].reverse().forEach(({ from, to }) => tr.delete(from, to));
    editor.view.dispatch(tr);
  }, [attachments, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    try {
      const result = await uploadMedia.mutateAsync(file);
      editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run();
    } catch {
      alert("Не удалось загрузить изображение");
    }
  }, [editor, uploadMedia]);

  const handleLinkToggle = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt("Введите URL:");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleInsertFile = useCallback((att: AttachmentMeta) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "fileEmbed",
      attrs: { filename: att.filename, path: att.path, size: att.size, mimeType: att.mime_type },
    }).run();
    setShowFilePicker(false);
  }, [editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");
  const currentColor = editor.getAttributes("textStyle").color as string | undefined;

  return (
    <div style={{
      border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 320px)", minHeight: "480px",
    }}>
      {/* Toolbar — sticky под навбаром, не двигается при внутреннем скролле */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px",
        padding: "6px 10px", borderBottom: "1px solid var(--color-background-secondary)",
        background: "var(--color-background-primary)",
        borderRadius: "var(--radius-m) var(--radius-m) 0 0",
        position: "sticky", top: "64px", zIndex: 20,
      }}>
        {/* ── Formatting ── */}
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Жирный (Ctrl+B)"><b>B</b></ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив (Ctrl+I)"><i>I</i></ToolBtn>
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Подчёркивание"><u>U</u></ToolBtn>
        <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Зачёркивание"><s>S</s></ToolBtn>
        <ToolBtn active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Верхний индекс">x²</ToolBtn>
        <ToolBtn active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Нижний индекс">x₂</ToolBtn>

        <Sep />

        {/* ── Highlight & Color ── */}
        <ToolBtn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Выделить маркером">
          <span style={{ background: editor.isActive("highlight") ? "transparent" : "#ffe066", padding: "0 3px", borderRadius: "2px" }}>▐</span>
        </ToolBtn>
        {/* Color picker */}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            type="button"
            title="Цвет текста"
            onClick={() => colorInputRef.current?.click()}
            style={{
              padding: "4px 7px", border: "none", borderRadius: "var(--radius-s)",
              background: "transparent", cursor: "pointer", fontFamily: "MTS Compact",
              fontSize: "13px", fontWeight: 700, lineHeight: 1, position: "relative",
            }}
          >
            <span style={{ borderBottom: `3px solid ${currentColor ?? "#1d2023"}` }}>A</span>
          </button>
          {currentColor && (
            <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} title="Сбросить цвет"
              style={{ padding: "2px 4px", border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", color: "var(--color-text-tertiary)" }}><Icon name="CrossSize16StyleOutline" size={12} /></button>
          )}
          <input
            ref={colorInputRef}
            type="color"
            defaultValue="#1d2023"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>

        <Sep />

        {/* ── Headings ── */}
        <ToolBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Заголовок 1">H1</ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок 2">H2</ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Заголовок 3">H3</ToolBtn>

        <Sep />

        {/* ── Alignment ── */}
        <ToolBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="По левому краю">←</ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="По центру">↔</ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="По правому краю">→</ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="По ширине">≡</ToolBtn>

        <Sep />

        {/* ── Lists ── */}
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Маркированный список">• —</ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерованный список">1.</ToolBtn>
        <ToolBtn active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Список задач (чеклист)"><Icon name="ChecklistSize24StyleOutline" size={16} /></ToolBtn>

        <Sep />

        {/* ── Block elements ── */}
        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Цитата">"</ToolBtn>
        <ToolBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline код">`</ToolBtn>
        <ToolBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Блок кода">{"</>"}</ToolBtn>
        <ToolBtn active={editor.isActive("details")} onClick={() => {
          const { to } = editor.state.selection;
          editor.chain().focus().setTextSelection(to).setDetails().run();
        }} title="Спойлер (сворачиваемый блок)"><Icon name="PlaySize24StyleFill" size={12} /></ToolBtn>

        <Sep />

        {/* ── Table ── */}
        {!inTable ? (
          <ToolBtn active={false} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Вставить таблицу 3×3"><Icon name="ViewTableSize24StyleOutline" size={16} /></ToolBtn>
        ) : (
          <>
            <ToolBtn active={false} onClick={() => editor.chain().focus().addRowBefore().run()} title="Строка выше">↑ стр</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().addRowAfter().run()} title="Строка ниже">↓ стр</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().deleteRow().run()} title="Удалить строку">✕ стр</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().addColumnBefore().run()} title="Колонка слева">↑ кол</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().addColumnAfter().run()} title="Колонка справа">↓ кол</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().deleteColumn().run()} title="Удалить колонку">✕ кол</ToolBtn>
            <ToolBtn active={false} onClick={() => editor.chain().focus().deleteTable().run()} title="Удалить таблицу"><span style={{ color: "var(--color-accent-negative)", display: "inline-flex" }}><Icon name="ViewTableSize24StyleOutline" size={16} /></span></ToolBtn>
          </>
        )}

        <Sep />

        {/* ── Media ── */}
        <ToolBtn active={editor.isActive("link")} onClick={handleLinkToggle} title="Ссылка"><Icon name="LinkSize24StyleOutline" size={16} /></ToolBtn>
        <ToolBtn active={false} onClick={() => fileInputRef.current?.click()} title="Вставить изображение" disabled={uploadMedia.isPending}><Icon name="PictureSize24StyleOutline" size={16} /></ToolBtn>

        {/* File embed picker */}
        <div style={{ position: "relative" }} ref={filePickerRef}>
          <ToolBtn
            active={showFilePicker}
            onClick={() => setShowFilePicker((v) => !v)}
            title="Вставить вложение в текст"
            disabled={!attachments.length}
          ><Icon name="DocumentSize24StyleOutline" size={16} /></ToolBtn>
          {showFilePicker && attachments.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
              background: "var(--color-background-primary)",
              border: "1px solid var(--color-background-secondary)",
              borderRadius: "var(--radius-m)",
              boxShadow: "var(--shadow-middle)",
              padding: "8px",
              minWidth: "240px",
              display: "flex", flexDirection: "column", gap: "2px",
            }}>
              <p style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 4px" }}>
                Выберите вложение
              </p>
              {attachments.map((att) => (
                <button
                  key={att.path}
                  type="button"
                  onClick={() => handleInsertFile(att)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "8px 10px", background: "transparent", border: "none",
                    borderRadius: "var(--radius-s)", cursor: "pointer", textAlign: "left",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-background-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon name="DocumentSize24StyleOutline" size={15} style={{ color: "var(--color-icons-secondary)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {att.filename}
                  </span>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                    {formatBytes(att.size)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* ── History ── */}
        <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Отменить" disabled={!editor.can().undo()}><Icon name="ReturnSize24StyleOutline" size={16} /></ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Повторить" disabled={!editor.can().redo()}><Icon name="ReturnSize24StyleOutline" size={16} style={{ transform: "scaleX(-1)" }} /></ToolBtn>
      </div>

      {/* Scrollable content area */}
      <div style={{
        flex: 1, overflowY: "auto",
        background: "var(--color-background-primary)",
        borderRadius: "0 0 var(--radius-m) var(--radius-m)",
      }}>
        <div style={{ padding: "20px 24px" }}>
          <EditorContent editor={editor} />
        </div>
        {tocEnabled && <TocPanel items={tocItems} />}
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
    </div>
  );
}
