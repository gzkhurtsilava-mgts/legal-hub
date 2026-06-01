"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@mts-ds/granat2-react-card";
import { DocumentIcon, OpenBookIcon, NewsIcon } from "@/components/icons";

const SERVICES = [
  {
    href: "/services/poa",
    Icon: DocumentIcon,
    title: "Навигатор доверенностей",
    description: "Поиск и оформление доверенностей по типу полномочий",
    color: "var(--brand-blue)",
  },
  {
    href: "/services/disputes",
    Icon: DocumentIcon,
    title: "Статус спора",
    description: "Отслеживание судебных дел и претензионной работы",
    color: "var(--color-accent-positive)",
  },
  {
    href: "/knowledge",
    Icon: OpenBookIcon,
    title: "База знаний",
    description: "Правовые инструкции, шаблоны и регламенты БПО",
    color: "var(--color-accent-warning)",
  },
  {
    href: "/knowledge/news",
    Icon: NewsIcon,
    title: "Правовые новости",
    description: "Изменения законодательства, важные для МГТС",
    color: "var(--color-accent-negative)",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div style={{ padding: "32px" }} />;
  }

  return (
    <div style={{ padding: "32px 24px" }}>
      <h1
        style={{
          fontFamily: "MTS Wide",
          fontWeight: 700,
          fontSize: "28px",
          color: "var(--color-text-primary)",
          marginBottom: "8px",
        }}
      >
        {session?.user.name ? `Добро пожаловать, ${session.user.name.split(" ")[0]}` : "Портал БПО"}
      </h1>
      <p
        style={{
          fontFamily: "MTS Compact",
          fontSize: "15px",
          color: "var(--color-text-secondary)",
          marginBottom: "32px",
        }}
      >
        Правовое обеспечение МГТС
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {SERVICES.map((service) => {
          const { Icon } = service;
          return (
            <Card
              key={service.href}
              variant="default"
              device="desktop"
              size="m"
              cornerRadius={32}
              onClick={() => router.push(service.href)}
              style={{ cursor: "pointer", padding: "24px" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-m)",
                  background: `${service.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon size={24} style={{ color: service.color }} />
              </div>
              <p
                style={{
                  fontFamily: "MTS Wide",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--color-text-primary)",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {service.title}
              </p>
              <p
                style={{
                  fontFamily: "MTS Compact",
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {service.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
