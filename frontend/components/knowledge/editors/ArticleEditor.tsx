"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useUploadMedia } from "@/lib/api/knowledge";

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolBtn({
  active = false,
  onClick,
  title,
  children,
  disabled = false,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 9px",
        border: "none",
        borderRadius: "var(--radius-s)",
        background: active ? "var(--brand-blue)" : "transparent",
        color: active ? "#fff" : "var(--color-text-primary)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        fontFamily: "MTS Compact",
        fontSize: "13px",
        fontWeight: 500,
        minWidth: "28px",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: "1px", height: "20px", background: "var(--color-background-secondary)", margin: "0 4px" }} />;
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function ArticleEditor({
  initialContent,
  tocEnabled = false,
  onSave,
  isSaving = false,
}: {
  initialContent?: Record<string, unknown> | null;
  tocEnabled?: boolean;
  onSave: (content: Record<string, unknown>, tocEnabled: boolean) => void;
  isSaving?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Начните вводить текст статьи…" }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: { spellcheck: "true" },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const result = await uploadMedia.mutateAsync(file);
        editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run();
      } catch {
        alert("Не удалось загрузить изображение");
      }
    },
    [editor, uploadMedia]
  );

  const handleLinkToggle = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt("Введите URL:");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleSave = () => {
    if (!editor) return;
    onSave(editor.getJSON() as Record<string, unknown>, tocEnabled);
  };

  if (!editor) return null;

  return (
    <div style={{ border: "1.5px solid var(--color-background-secondary)", borderRadius: "var(--radius-m)", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: "2px",
        padding: "8px 12px",
        borderBottom: "1px solid var(--color-background-secondary)",
        background: "var(--color-background-primary)",
      }}>
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Жирный (Ctrl+B)">
          <b>B</b>
        </ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив (Ctrl+I)">
          <i>I</i>
        </ToolBtn>
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Подчёркивание (Ctrl+U)">
          <u>U</u>
        </ToolBtn>
        <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Зачёркивание">
          <s>S</s>
        </ToolBtn>

        <Sep />

        <ToolBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Заголовок 1">H1</ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок 2">H2</ToolBtn>
        <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Заголовок 3">H3</ToolBtn>

        <Sep />

        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Маркированный список">• —</ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерованный список">1.</ToolBtn>

        <Sep />

        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Цитата">"</ToolBtn>
        <ToolBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline код">{"`"}</ToolBtn>
        <ToolBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Блок кода">{"</>"}</ToolBtn>

        <Sep />

        <ToolBtn active={editor.isActive("link")} onClick={handleLinkToggle} title="Ссылка">🔗</ToolBtn>
        <ToolBtn
          active={false}
          onClick={() => fileInputRef.current?.click()}
          title="Вставить изображение"
          disabled={uploadMedia.isPending}
        >
          🖼
        </ToolBtn>

        <Sep />

        <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Отменить" disabled={!editor.can().undo()}>↩</ToolBtn>
        <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Повторить" disabled={!editor.can().redo()}>↪</ToolBtn>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px", background: "var(--color-background-primary)", minHeight: "320px" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--color-background-secondary)",
        background: "var(--color-background-primary)",
        display: "flex", justifyContent: "flex-end",
      }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "8px 24px",
            background: isSaving ? "var(--color-background-secondary)" : "var(--brand-blue)",
            color: isSaving ? "var(--color-text-secondary)" : "#fff",
            border: "none",
            borderRadius: "var(--radius-l)",
            fontFamily: "MTS Compact",
            fontSize: "14px",
            fontWeight: 500,
            cursor: isSaving ? "default" : "pointer",
          }}
        >
          {isSaving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
