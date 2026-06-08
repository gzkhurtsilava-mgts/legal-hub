"use client";

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
          <button onClick={onCancel} style={cancelBtn}>Отмена</button>
          <button onClick={onConfirm} style={danger ? dangerBtn : confirmBtn}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const cancelBtn: React.CSSProperties = {
  padding: "8px 20px", background: "var(--color-background-secondary)", border: "none",
  borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px",
  color: "var(--color-text-primary)", cursor: "pointer",
};
const dangerBtn: React.CSSProperties = {
  padding: "8px 20px", background: "var(--color-accent-negative)", border: "none",
  borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px",
  color: "#fff", fontWeight: 500, cursor: "pointer",
};
const confirmBtn: React.CSSProperties = {
  padding: "8px 20px", background: "var(--brand-blue)", border: "none",
  borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px",
  color: "#fff", fontWeight: 500, cursor: "pointer",
};
