"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCreateDomain } from "@/lib/api/processes";

export default function NewDomainPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useCreateDomain();

  if (role && role !== "admin" && role !== "lawyer") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>Нет прав доступа</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!id.trim() || !name.trim()) {
      setError("Заполните ID и Название");
      return;
    }
    const body = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      mission: description.trim() || undefined,
    };
    try {
      const created = await create.mutateAsync(body);
      router.push(`/processes/edit/domains/${created.id}`);
    } catch (err) {
      setError((err as Error)?.message ?? "Ошибка создания");
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>Карта процессов</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>Редактирование</button>
        <span style={sep}>›</span>
        <button onClick={() => router.push("/processes/edit/domains")} style={linkBtn}>Домены</button>
        <span style={sep}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>Новый домен</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 28px" }}>
        Новый домен
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>ID <span style={{ color: "var(--color-accent-negative)" }}>*</span></label>
              <input
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                placeholder="CONTRACT"
                required
                maxLength={20}
                style={{ ...inp, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em" }}
              />
              <p style={hint}>Латиница, без пробелов</p>
            </div>
            <div>
              <label style={lbl}>Название <span style={{ color: "var(--color-accent-negative)" }}>*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Договорная работа"
                required
                style={inp}
              />
            </div>
          </div>
        </div>

        <div style={card}>
          <label style={lbl}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание домена — чем занимается, какие задачи решает"
            rows={3}
            style={{ ...inp, resize: "vertical" }}
          />
        </div>

        {error && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-accent-negative)", margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={create.isPending} style={primaryBtn}>
            {create.isPending ? "Создание…" : "Создать домен"}
          </button>
          <button type="button" onClick={() => router.push("/processes/edit/domains")} style={secondaryBtn}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

const card: React.CSSProperties = { background: "var(--color-background-primary)", borderRadius: "var(--radius-m)", border: "1px solid var(--color-background-lower)", padding: "16px 20px" };
const lbl: React.CSSProperties = { display: "block", fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" };
const hint: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: "4px 0 0" };
const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
const primaryBtn: React.CSSProperties = { padding: "10px 24px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { padding: "10px 18px", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", cursor: "pointer" };
const linkBtn: React.CSSProperties = { fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 };
const sep: React.CSSProperties = { color: "var(--color-text-tertiary)" };
