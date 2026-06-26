"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDomains, useLandscape, useProcesses } from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { Button, LinkButton, Badge } from "@/components/ui";

const QUICK_LINKS = [
  { label: "Роли", href: "/processes/edit/refs/roles", icon: "UserSize24StyleOutline" },
  { label: "ИТ-системы", href: "/processes/edit/refs/systems", icon: "MonitorSize24StyleOutline" },
  { label: "Нормативные акты", href: "/processes/edit/refs/regulations", icon: "GavelSize24StyleOutline" },
  { label: "Политики", href: "/processes/edit/refs/policies", icon: "ChecklistSize24StyleOutline" },
  { label: "Риски", href: "/processes/edit/refs/risks", icon: "WarningSize24StyleOutline" },
  { label: "Типы документов", href: "/processes/edit/refs/doc-types", icon: "DocumentSize24StyleOutline" },
  { label: "Бизнес-юниты", href: "/processes/edit/refs/business-units", icon: "BusinessSize24StyleOutline" },
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
        <LinkButton onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
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
              <Button
                onClick={() => router.push("/processes/edit/domains/new")}
                icon={<Icon name="PlusSize24StyleOutline" size={16} />}
              >
                Создать
              </Button>
              <Button variant="secondary" onClick={() => router.push("/processes/edit/domains")}>
                Все домены
              </Button>
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
                  className="ui-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--radius-s)",
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
                <LinkButton
                  onClick={() => router.push("/processes/edit/domains")}
                  iconRight={<Icon name="ArrowRightSize24StyleOutline" size={14} />}
                  style={{ padding: "4px 0", fontSize: "13px" }}
                >
                  Ещё {domains.length - 5} доменов
                </LinkButton>
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
                className="ui-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "none",
                  border: "none",
                  borderRadius: "var(--radius-s)",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", color: "var(--color-icons-secondary)" }}>
                  <Icon name={link.icon} size={18} />
                </span>
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
            <Button
              onClick={() => router.push("/processes/edit/processes/new")}
              icon={<Icon name="PlusSize24StyleOutline" size={16} />}
            >
              Создать
            </Button>
            <Button variant="secondary" onClick={() => router.push("/processes/edit/processes")}>
              Все процессы
            </Button>
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
                className="ui-row"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-s)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <Badge tone={p.type === "workflow" ? "brand" : "positive"}>
                    {p.type === "workflow" ? "Проц." : "Услуга"}
                  </Badge>
                  <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0, marginLeft: "12px" }}>{p.domain_id}</span>
              </div>
            ))}
            {processes.length > 6 && (
              <LinkButton
                onClick={() => router.push("/processes/edit/processes")}
                iconRight={<Icon name="ArrowRightSize24StyleOutline" size={14} />}
                style={{ padding: "4px 0", fontSize: "13px" }}
              >
                Ещё {processes.length - 6} процессов
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
