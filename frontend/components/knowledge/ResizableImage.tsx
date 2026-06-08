"use client";

import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const SIZES = ["25%", "50%", "75%", "100%"] as const;

function ResizableImageView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const { src, alt, title, width } = node.attrs as {
    src: string; alt?: string; title?: string; width?: string | null;
  };
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper style={{ display: "block", position: "relative" }}>
      <img
        src={src}
        alt={alt ?? ""}
        title={title ?? undefined}
        style={{
          width: width ?? "100%",
          maxWidth: "100%",
          display: "block",
          borderRadius: "var(--radius-m)",
          outline: selected && editable ? "2px solid var(--brand-blue)" : "none",
          outlineOffset: "2px",
        }}
      />

      {/* Size controls — only in edit mode when selected */}
      {selected && editable && (
        <div style={{
          position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "4px",
          background: "var(--color-background-inverted)",
          borderRadius: "var(--radius-s)",
          padding: "4px 6px",
          boxShadow: "var(--shadow-middle)",
        }}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                updateAttributes({ width: s });
              }}
              style={{
                padding: "2px 8px",
                border: "none",
                borderRadius: "3px",
                background: width === s ? "var(--brand-blue)" : "transparent",
                color: width === s ? "#fff" : "var(--color-text-inverted)",
                fontFamily: "MTS Compact",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              updateAttributes({ width: null });
            }}
            style={{
              padding: "2px 8px",
              border: "none",
              borderRadius: "3px",
              background: !width ? "var(--brand-blue)" : "transparent",
              color: !width ? "#fff" : "var(--color-text-inverted)",
              fontFamily: "MTS Compact",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            авто
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => (el as HTMLImageElement).style.width || (el as HTMLImageElement).getAttribute("width") || null,
        renderHTML: (attrs) => attrs.width ? { style: `width: ${attrs.width}` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
