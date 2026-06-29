"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useDomains, useDeleteDomain, type PmDomain } from "@/lib/api/processes";
import { Icon } from "@/components/icons";
import { Button, LinkButton, IconButton } from "@/components/ui";

function DomainRow({ domain, onEdit }: { domain: PmDomain; onEdit: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeleteDomain(domain.id);

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--radius-m)",
        border: "1px solid var(--color-background-lower)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "MTS Compact",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            {domain.name}
          </span>
          <span
            style={{
              fontFamily: "MTS Compact",
              fontSize: "11px",
              color: "var(--color-text-tertiary)",
              background: "var(--color-background-secondary)",
              padding: "1px 8px",
              borderRadius: "999px",
            }}
          >
            {domain.id}
          </span>
        </div>
        {domain.mission && (
          <p
            style={{
              fontFamily: "MTS Compact",
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              margin: "4px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {domain.mission}
          </p>
        )}
      </div>

      <span
        style={{
          fontFamily: "MTS Compact",
          fontSize: "12px",
          color: "var(--color-text-tertiary)",
          flexShrink: 0,
        }}
      >
        {domain.process_count} проц.
      </span>

      <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
        <IconButton size={32} onClick={onEdit} label="Редактировать">
          <Icon name="EditSize24StyleOutline" size={16} />
        </IconButton>
        {!confirmDelete ? (
          <IconButton
            size={32}
            danger
            onClick={() => setConfirmDelete(true)}
            disabled={domain.process_count > 0}
            label="Удалить"
            title={domain.process_count > 0 ? "Нельзя удалить: есть процессы" : "Удалить"}
          >
            <Icon name="DeleteSize24StyleOutline" size={16} />
          </IconButton>
        ) : (
          <>
            <Button
              size="xs"
              variant="negative"
              onClick={async () => {
                await del.mutateAsync();
                setConfirmDelete(false);
              }}
              disabled={del.isPending}
            >
              {del.isPending ? "…" : "Удалить"}
            </Button>
            <Button size="xs" variant="secondary" onClick={() => setConfirmDelete(false)}>Нет</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DomainsListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const { data: domains = [], isLoading } = useDomains();

  const canEdit = role === "admin" || role === "lawyer";

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <LinkButton onClick={() => router.push("/processes")}>Карта процессов</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <LinkButton onClick={() => router.push("/processes/edit")}>Редактирование</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Домены
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <h1
          style={{
            fontFamily: "MTS Wide",
            fontWeight: 700,
            fontSize: "24px",
            color: "var(--color-text-primary)",
            margin: 0,
            flex: 1,
          }}
        >
          Домены (L2)
        </h1>
        {canEdit && (
          <Button onClick={() => router.push("/processes/edit/domains/new")} icon={<Icon name="PlusSize24StyleOutline" size={16} />}>
            Создать домен
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={24} />
        </div>
      ) : domains.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "var(--color-background-primary)",
            borderRadius: "var(--radius-m)",
          }}
        >
          <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", margin: "0 0 16px" }}>
            Доменов пока нет
          </p>
          {canEdit && (
            <Button onClick={() => router.push("/processes/edit/domains/new")}>
              Создать первый домен
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {domains.map((d) => (
            <DomainRow
              key={d.id}
              domain={d}
              onEdit={() => router.push(`/processes/edit/domains/${d.id}`)}
            />
          ))}
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "8px" }}>
            Всего: {domains.length}
          </p>
        </div>
      )}
    </div>
  );
}

