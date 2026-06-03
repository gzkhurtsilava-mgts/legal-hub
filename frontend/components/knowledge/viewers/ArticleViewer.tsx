"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import type { AttachmentMeta } from "@/lib/api/knowledge";

function buildToc(content: Record<string, unknown>): { id: string; level: number; text: string }[] {
  const toc: { id: string; level: number; text: string }[] = [];
  const nodes = (content?.content as Record<string, unknown>[] | undefined) ?? [];

  function extractText(node: Record<string, unknown>): string {
    if (node.type === "text") return (node.text as string) ?? "";
    return ((node.content as Record<string, unknown>[]) ?? []).map(extractText).join("");
  }

  nodes.forEach((node, i) => {
    if (node.type === "heading") {
      const level = (node.attrs as Record<string, unknown>)?.level as number;
      const text = extractText(node);
      toc.push({ id: `h-${i}`, level, text });
    }
  });
  return toc;
}

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

  function fileUrl(path: string) {
    return token ? `/api/files/${path}?token=${encodeURIComponent(token)}` : `/api/files/${path}`;
  }
  const toc = tocEnabled && content ? buildToc(content) : [];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: true }),
    ],
    content: content ?? undefined,
    editable: false,
    immediatelyRender: false,
  });

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
      {toc.length > 0 && (
        <aside style={{
          flexShrink: 0, width: "200px", position: "sticky", top: "80px",
          borderLeft: "2px solid var(--color-background-secondary)", paddingLeft: "16px",
        }}>
          <p style={{ fontFamily: "MTS Compact", fontSize: "11px", fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            Содержание
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {toc.map((item) => (
              <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                <a
                  href={`#${item.id}`}
                  style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--brand-blue)", textDecoration: "none", lineHeight: 1.4, display: "block" }}
                >
                  {item.text}
                </a>
              </li>
            ))}
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
