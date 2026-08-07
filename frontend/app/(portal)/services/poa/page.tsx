"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/ui";

interface Section {
  href: string;
  title: string;
  description: string;
  icon: string;
  /** Доступ: all — всем сотрудникам; manage — только юрист/админ */
  access?: "all" | "manage";
}

const SECTIONS: Section[] = [
  {
    href: "/services/poa/navigator",
    title: "Навигатор доверенностей",
    description: "Подскажем, куда подать заявку на оформление",
    icon: "CatalogSearchSize24StyleOutline",
    access: "all",
  },
  {
    href: "/services/poa/catalog",
    title: "Каталог полномочий",
    description: "Полномочия, категории, подразделения, уровни и лимиты",
    icon: "ShieldCheckSize24StyleOutline",
  },
  {
    href: "/services/poa/matrix",
    title: "Матрица доступности",
    description: "Какие полномочия доступны по подразделениям",
    icon: "ViewTableSize24StyleOutline",
  },
  {
    href: "/services/poa/registry",
    title: "Реестр доверенностей",
    description: "Выданные доверенности и выдача оригиналов",
    icon: "DocumentSize24StyleOutline",
  },
  {
    href: "/services/poa/constructor",
    title: "Конструктор",
    description: "Сформировать доверенность по шаблону (docx / PDF)",
    icon: "EditSize24StyleOutline",
  },
  {
    href: "/services/poa/employees",
    title: "Сотрудники",
    description: "Привязка сотрудников к подразделению и уровню",
    icon: "ProfileSize24StyleOutline",
  },
];

export default function PoaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canManage = role === "admin" || role === "lawyer";
  const visible = SECTIONS.filter((s) => canManage || s.access === "all");

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <PageHeader
        title="Доверенности"
        subtitle="Единый центр управления доверенностями БПО"
      />

      {(
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {visible.map((s) => (
            <button
              key={s.href}
              type="button"
              onClick={() => router.push(s.href)}
              className="ui-cardlink"
              style={{
                textAlign: "left",
                cursor: "pointer",
                background: "var(--color-background-primary)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-l)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-m)",
                  background: "var(--color-accent-brand-bg)",
                  color: "var(--color-brand)",
                }}
              >
                <Icon name={s.icon} size={24} />
              </span>
              <span
                style={{
                  fontFamily: "MTS Compact, sans-serif",
                  fontWeight: 500,
                  fontSize: "17px",
                  color: "var(--color-text-primary)",
                }}
              >
                {s.title}
              </span>
              <span
                style={{
                  fontFamily: "MTS Compact, sans-serif",
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {s.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
