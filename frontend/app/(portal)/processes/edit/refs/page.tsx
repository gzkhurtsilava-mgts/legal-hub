"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { LinkButton } from "@/components/ui";

const REF_TABLES = [
  {
    slug: "roles",
    label: "Роли",
    description: "Должности и роли в процессах (владелец, исполнитель, согласующий…)",
    icon: "UserSize24StyleOutline",
  },
  {
    slug: "systems",
    label: "ИТ-системы",
    description: "Корпоративные системы, задействованные в процессах",
    icon: "MonitorSize24StyleOutline",
  },
  {
    slug: "regulations",
    label: "Нормативные акты",
    description: "Законы, регламенты, ГОСТ, стандарты",
    icon: "GavelSize24StyleOutline",
  },
  {
    slug: "policies",
    label: "Политики",
    description: "Внутренние политики и стандарты МГТС / БПО",
    icon: "ChecklistSize24StyleOutline",
  },
  {
    slug: "risks",
    label: "Риски",
    description: "Операционные, правовые и регуляторные риски",
    icon: "WarningSize24StyleOutline",
  },
  {
    slug: "doc-types",
    label: "Типы документов",
    description: "Договор, приказ, доверенность, заявление…",
    icon: "DocumentSize24StyleOutline",
  },
  {
    slug: "business-units",
    label: "Бизнес-юниты",
    description: "Подразделения МГТС — клиенты, надзор, сам БПО",
    icon: "BusinessSize24StyleOutline",
  },
];

export default function RefsOverviewPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <LinkButton onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <LinkButton onClick={() => router.push("/processes/edit")}>Редактирование</LinkButton>
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
            className="ui-cardlink"
            style={{
              background: "var(--color-background-primary)",
              borderRadius: "var(--radius-m)",
              border: "1px solid var(--color-background-lower)",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "10px", color: "var(--brand-blue)", display: "flex" }}>
              <Icon name={t.icon} size={28} />
            </div>
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
