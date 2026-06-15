"use client";

import { useRouter } from "next/navigation";

const REF_TABLES = [
  {
    slug: "roles",
    label: "Роли",
    description: "Должности и роли в процессах (владелец, исполнитель, согласующий…)",
    icon: "👤",
  },
  {
    slug: "systems",
    label: "ИТ-системы",
    description: "Корпоративные системы, задействованные в процессах",
    icon: "💻",
  },
  {
    slug: "regulations",
    label: "Нормативные акты",
    description: "Законы, регламенты, ГОСТ, стандарты",
    icon: "📜",
  },
  {
    slug: "policies",
    label: "Политики",
    description: "Внутренние политики и стандарты МГТС / БПО",
    icon: "📋",
  },
  {
    slug: "risks",
    label: "Риски",
    description: "Операционные, правовые и регуляторные риски",
    icon: "⚠️",
  },
  {
    slug: "doc-types",
    label: "Типы документов",
    description: "Договор, приказ, доверенность, заявление…",
    icon: "📄",
  },
  {
    slug: "business-units",
    label: "Бизнес-юниты",
    description: "Подразделения МГТС — клиенты, надзор, сам БПО",
    icon: "🏢",
  },
];

export default function RefsOverviewPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          Карта процессов
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>
          Редактирование
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Справочники
        </span>
      </div>

      <h1
        style={{
          fontFamily: "MTS Wide",
          fontWeight: 700,
          fontSize: "24px",
          color: "var(--color-text-primary)",
          margin: "0 0 8px",
        }}
      >
        Справочники
      </h1>
      <p
        style={{
          fontFamily: "MTS Compact",
          fontSize: "14px",
          color: "var(--color-text-secondary)",
          margin: "0 0 32px",
        }}
      >
        Нормативные данные, которые используются в процессах: роли, системы, риски, документы
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {REF_TABLES.map((t) => (
          <div
            key={t.slug}
            onClick={() => router.push(`/processes/edit/refs/${t.slug}`)}
            style={{
              background: "var(--color-background-primary)",
              borderRadius: "var(--radius-m)",
              border: "1px solid var(--color-background-lower)",
              padding: "20px",
              cursor: "pointer",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-low)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
          >
            <div style={{ fontSize: "28px", marginBottom: "10px" }}>{t.icon}</div>
            <p
              style={{
                fontFamily: "MTS Wide",
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--color-text-primary)",
                margin: "0 0 6px",
              }}
            >
              {t.label}
            </p>
            <p
              style={{
                fontFamily: "MTS Compact",
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {t.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "14px",
  color: "var(--brand-blue)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
