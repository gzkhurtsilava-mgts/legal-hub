"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import StarterKit from "@tiptap/starter-kit";
import { ResizableImage } from "@/components/knowledge/ResizableImage";
import Link from "@tiptap/extension-link";
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
import type { AttachmentMeta } from "@/lib/api/knowledge";
import { FileEmbedExtension } from "@/components/knowledge/editors/FileEmbedExtension";

interface TocItem { id: string; level: number; textContent: string; }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function ArticleViewer({
  content,
  tocEnabled = false,
  attachments = [],
}: {
  content: Record<string, unknown> | null;
  tocEnabled?: boolean;
  attachments?: AttachmentMeta[];
}) {
  const { data: session } = useSession();
  const token = (session as Record<string, unknown> | null)?.accessToken as string | undefined;
  const tokenRef = useRef<string | undefined>(undefined);
  tokenRef.current = token;
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  function fileUrl(path: string) {
    return token ? `/api/files/${path}?token=${encodeURIComponent(token)}` : `/api/files/${path}`;
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage.configure({ inline: false }),
      Link.configure({ openOnClick: true }),
      Table.configure({ resizable: false }),
      TableRow, TableCell, TableHeader,
      TableOfContents.configure({
        onUpdate(content: TocItem[]) { setTocItems(content); },
      }),
      Details.configure({ persist: true, HTMLAttributes: { class: "tiptap-details" } }),
      DetailsSummary,
      DetailsContent,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      Superscript,
      Subscript,
      Typography,
      FileEmbedExtension.configure({ editable: false, tokenRef }),
    ],
    content: content ?? undefined,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap-readonly" } },
  });

  useEffect(() => {
    if (!editor || !tocItems.length) return;
    const ed = editor;
    const THRESHOLD = 88; // header 64px + небольшой буфер

    function updateActive() {
      const headings = Array.from(
        ed.view.dom.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id]")
      );
      if (!headings.length) return;
      // Последний заголовок, чей верх прошёл выше THRESHOLD от верха viewport
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= THRESHOLD) current = h.id;
      }
      setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [editor, tocItems]);



  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom;
    function handleClick(e: MouseEvent) {
      const summary = (e.target as Element).closest('summary');
      if (!summary) return;
      const details = summary.closest('[data-type="details"]');
      if (details) details.classList.toggle('is-open');
    }
    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [editor]);

  if (!content) {
    return (
      <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-tertiary)", padding: "24px 0" }}>
        Статья пока не заполнена.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
      {/* ToC sidebar */}
      {tocEnabled && tocItems.length > 0 && (
        <aside style={{
          flexShrink: 0, width: "200px", position: "sticky", top: "80px",
          borderLeft: "2px solid var(--color-background-secondary)", paddingLeft: "16px",
        }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            Содержание
          </p>
          <ul style={{ listStyle: "none !important" as React.CSSProperties["listStyle"], padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {tocItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px`, listStyle: "none" }}>
                  <a
                    href={`#${item.id}`}
                    style={{
                      fontFamily: "MTS Compact", fontSize: "13px", lineHeight: 1.4, display: "block",
                      textDecoration: "none", transition: "color 150ms, font-weight 0ms",
                      color: isActive ? "var(--color-text-primary)" : "var(--brand-blue)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.textContent}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* Article body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <EditorContent editor={editor} />

        {/* Attachments */}
        {attachments.length > 0 && (
          <div style={{ marginTop: "32px", borderTop: "1px solid var(--color-background-secondary)", paddingTop: "20px" }}>
            <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", marginBottom: "12px" }}>
              Прикреплённые файлы
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {attachments.map((att) => (
                <a
                  key={att.path}
                  href={fileUrl(att.path)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px",
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--radius-m)",
                    textDecoration: "none",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📎</span>
                  <span style={{ flex: 1, fontFamily: "MTS Compact", fontSize: "14px" }}>{att.filename}</span>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    {formatBytes(att.size)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
