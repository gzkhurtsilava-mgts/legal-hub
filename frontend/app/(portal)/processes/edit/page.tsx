"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDomains, useLandscape, useProcesses } from "@/lib/api/processes";

const QUICK_LINKS = [
  { label: "Роли", href: "/processes/edit/refs/roles", icon: "👤" },
  { label: "ИТ-системы", href: "/processes/edit/refs/systems", icon: "💻" },
  { label: "Нормативные акты", href: "/processes/edit/refs/regulations", icon: "📜" },
  { label: "Политики", href: "/processes/edit/refs/policies", icon: "📋" },
  { label: "Риски", href: "/processes/edit/refs/risks", icon: "⚠️" },
  { label: "Типы документов", href: "/processes/edit/refs/doc-types", icon: "📄" },
  { label: "Бизнес-юниты", href: "/processes/edit/refs/business-units", icon: "🏢" },
];

export default function ProcessesEditPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const { data: landscape } = useLandscape();
  const { data: domains = [] } = useDomains();
  const { data: processes = [] } = useProcesses();
  const draftCount = processes.filter((p) => p.status === "draft").length;

  if (role && role !== "admin" && role !== "lawyer") {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)" }}>
          Доступ только для администраторов и юристов
        </p>
      </div>
    );
  }


  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          Карта процессов
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Редактирование
        </span>
      </div>

      <h1
        style={{
          fontFamily: "MTS Wide",
          fontWeight: 700,
          fontSize: "24px",
          color: "var(--color-text-primary)",
          margin: "0 0 28px",
        }}
      >
        Редактирование карты процессов
      </h1>

      {/* Stats row */}
      {landscape && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Доменов", value: landscape.total_domains },
            { label: "Процессов и услуг", value: landscape.total_processes },
            { label: "Черновиков", value: draftCount },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--color-background-primary)",
                borderRadius: "var(--radius-m)",
                border: "1px solid var(--color-background-lower)",
                padding: "16px 24px",
                flex: 1,
              }}
            >
              <p
                style={{
                  fontFamily: "MTS Wide",
                  fontWeight: 700,
                  fontSize: "28px",
                  color: "var(--brand-blue)",
                  margin: "0 0 2px",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: "MTS Compact",
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main sections */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "32px" }}>
        {/* Domains card */}
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: "var(--radius-m)",
            border: "1px solid var(--color-background-lower)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", margin: 0 }}>
              Домены (L2)
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => router.push("/processes/edit/domains/new")}
                style={primaryBtn}
              >
                + Создать
              </button>
              <button
                onClick={() => router.push("/processes/edit/domains")}
                style={secondaryBtn}
              >
                Все домены
              </button>
            </div>
          </div>

          {domains.length === 0 ? (
            <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", margin: 0 }}>
              Доменов пока нет
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {domains.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  onClick={() => router.push(`/processes/edit/domains/${d.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--radius-s)",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {d.name}
                    </span>
                    <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", marginLeft: "8px" }}>
                      {d.id}
                    </span>
                  </div>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                    {d.process_count} проц.
                  </span>
                </div>
              ))}
              {domains.length > 5 && (
                <button
                  onClick={() => router.push("/processes/edit/domains")}
                  style={{ ...linkBtn, padding: "4px 0", fontSize: "13px" }}
                >
                  Ещё {domains.length - 5} доменов →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Справочники card */}
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: "var(--radius-m)",
            border: "1px solid var(--color-background-lower)",
            padding: "24px",
          }}
        >
          <h2 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", margin: "0 0 16px" }}>
            Справочники
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "none",
                  border: "none",
                  borderRadius: "var(--radius-s)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background-secondary)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
              >
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{link.icon}</span>
                <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)" }}>
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Processes L3 card */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: "var(--radius-m)",
          border: "1px solid var(--color-background-lower)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary)", margin: 0 }}>
            Процессы / Услуги (L3)
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => router.push("/processes/edit/processes/new")} style={primaryBtn}>
              + Создать
            </button>
            <button onClick={() => router.push("/processes/edit/processes")} style={secondaryBtn}>
              Все процессы
            </button>
          </div>
        </div>
        {processes.length === 0 ? (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0 }}>
            Процессов пока нет. Начните с создания первого.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {processes.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/processes/edit/processes/${p.id}`)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-s)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span style={{
                    padding: "1px 6px",
                    borderRadius: "var(--radius-s)",
                    fontSize: "10px",
                    fontFamily: "MTS Compact",
                    fontWeight: 500,
                    flexShrink: 0,
                    background: p.type === "workflow" ? "#e8f4fd" : "#f0f8ee",
                    color: p.type === "workflow" ? "var(--brand-blue)" : "var(--color-accent-positive)",
                    border: `1px solid ${p.type === "workflow" ? "#b3d9f7" : "#b8e6b0"}`,
                  }}>
                    {p.type === "workflow" ? "Проц." : "Услуга"}
                  </span>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0, marginLeft: "12px" }}>{p.domain_id}</span>
              </div>
            ))}
            {processes.length > 6 && (
              <button onClick={() => router.push("/processes/edit/processes")} style={{ ...linkBtn, padding: "4px 0", fontSize: "13px" }}>
                Ещё {processes.length - 6} процессов →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "var(--brand-blue)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  cursor: "pointer",
};

const linkBtn: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "14px",
  color: "var(--brand-blue)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
