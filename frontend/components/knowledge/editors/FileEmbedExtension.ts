import { Node, mergeAttributes } from "@tiptap/core";
import type { MutableRefObject } from "react";

export interface FileEmbedAttrs {
  filename: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface FileEmbedOptions {
  editable: boolean;
  tokenRef?: MutableRefObject<string | undefined>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

const CARD_BASE = [
  "display: flex",
  "align-items: center",
  "gap: 10px",
  "padding: 10px 14px",
  "margin: 8px 0",
  "background: var(--color-background-secondary)",
  "border-radius: var(--radius-m)",
  "border: 1.5px solid transparent",
  "transition: border-color 150ms",
  "user-select: none",
  "box-sizing: border-box",
  "width: 100%",
  "min-width: 0",
  "overflow: hidden",
].join(";");

export const FileEmbedExtension = Node.create<FileEmbedOptions>({
  name: "fileEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { editable: true };
  },

  addAttributes() {
    return {
      filename: { default: "" },
      path: { default: "" },
      size: { default: 0 },
      mimeType: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-embed"]',
        getAttrs: (el) => {
          const e = el as HTMLElement;
          return {
            filename: e.getAttribute("data-filename") ?? "",
            path: e.getAttribute("data-path") ?? "",
            size: parseInt(e.getAttribute("data-size") ?? "0", 10),
            mimeType: e.getAttribute("data-mime-type") ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { filename, path, size, mimeType } = node.attrs as FileEmbedAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "file-embed",
        "data-filename": filename,
        "data-path": path,
        "data-size": String(size),
        "data-mime-type": mimeType,
      }),
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const { editable, tokenRef } = this.options;
      const { filename, path, size } = node.attrs as FileEmbedAttrs;

      const dom = document.createElement("div");
      dom.setAttribute("data-type", "file-embed");
      dom.setAttribute("contenteditable", "false");
      dom.style.cssText = CARD_BASE;
      dom.style.cursor = editable ? "default" : "pointer";

      const iconEl = document.createElement("span");
      iconEl.textContent = "📎";
      iconEl.style.cssText = "font-size: 18px; flex-shrink: 0;";

      const nameEl = document.createElement("span");
      nameEl.textContent = filename || "—";
      nameEl.style.cssText =
        "flex: 1; min-width: 0; font-family: 'MTS Compact', sans-serif; font-size: 14px; font-weight: 400; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";

      const sizeEl = document.createElement("span");
      sizeEl.textContent = size ? formatBytes(size) : "";
      sizeEl.style.cssText =
        "font-family: 'MTS Compact', sans-serif; font-size: 12px; color: var(--color-text-tertiary); flex-shrink: 0;";

      dom.appendChild(iconEl);
      dom.appendChild(nameEl);
      dom.appendChild(sizeEl);

      if (editable) {
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.textContent = "✕";
        delBtn.title = "Удалить вложение из текста";
        delBtn.style.cssText =
          "background: none; border: none; cursor: pointer; padding: 2px 6px; font-size: 12px; color: var(--color-text-tertiary); border-radius: var(--radius-s); flex-shrink: 0; line-height: 1;";

        delBtn.addEventListener("mouseenter", () => {
          delBtn.style.color = "var(--color-accent-negative)";
        });
        delBtn.addEventListener("mouseleave", () => {
          delBtn.style.color = "var(--color-text-tertiary)";
        });
        delBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pos = typeof getPos === "function" ? getPos() : undefined;
          if (pos !== undefined) {
            editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
          }
        });

        dom.appendChild(delBtn);

        dom.addEventListener("mouseenter", () => {
          dom.style.borderColor = "var(--color-background-lower)";
        });
        dom.addEventListener("mouseleave", () => {
          dom.style.borderColor = "transparent";
        });
      } else {
        const dlEl = document.createElement("span");
        dlEl.textContent = "⬇";
        dlEl.style.cssText = "font-size: 14px; color: var(--brand-blue); flex-shrink: 0;";
        dom.appendChild(dlEl);

        dom.addEventListener("click", () => {
          const token = tokenRef?.current;
          const url = token
            ? `/api/files/${path}?token=${encodeURIComponent(token)}`
            : `/api/files/${path}`;
          window.open(url, "_blank", "noreferrer");
        });

        dom.addEventListener("mouseenter", () => {
          dom.style.borderColor = "var(--brand-blue)";
          nameEl.style.color = "var(--brand-blue)";
        });
        dom.addEventListener("mouseleave", () => {
          dom.style.borderColor = "transparent";
          nameEl.style.color = "var(--color-text-primary)";
        });
      }

      return { dom };
    };
  },
});
