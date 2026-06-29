"use client";

import { Button } from "@/components/ui";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({ title, message, confirmLabel = "Удалить", onConfirm, onCancel, danger = true }: ConfirmModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={onCancel}
    >
      <div
        style={{ background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", padding: "28px", maxWidth: "440px", width: "100%", boxShadow: "var(--shadow-high)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary)", margin: "0 0 12px" }}>
          {title}
        </h3>
        <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 24px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onCancel}>Отмена</Button>
          <Button variant={danger ? "negative" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
