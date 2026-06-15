"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useDomains, useDeleteDomain, type PmDomain } from "@/lib/api/processes";

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

      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button onClick={onEdit} style={iconBtn} title="Редактировать">
          ✏️
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={domain.process_count > 0}
            style={{
              ...iconBtn,
              color: domain.process_count > 0 ? "var(--color-text-tertiary)" : "var(--color-accent-negative)",
              cursor: domain.process_count > 0 ? "not-allowed" : "pointer",
            }}
            title={domain.process_count > 0 ? "Нельзя удалить: есть процессы" : "Удалить"}
          >
            🗑
          </button>
        ) : (
          <>
            <button
              onClick={async () => {
                await del.mutateAsync();
                setConfirmDelete(false);
              }}
              disabled={del.isPending}
              style={{ ...iconBtn, color: "var(--color-accent-negative)", fontWeight: 700 }}
            >
              {del.isPending ? "…" : "Удалить"}
            </button>
            <button onClick={() => setConfirmDelete(false)} style={iconBtn}>
              Нет
            </button>
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
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          Карта процессов
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <button onClick={() => router.push("/processes/edit")} style={linkBtn}>
          Редактирование
        </button>
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
          <button onClick={() => router.push("/processes/edit/domains/new")} style={primaryBtn}>
            + Создать домен
          </button>
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
            <button onClick={() => router.push("/processes/edit/domains/new")} style={primaryBtn}>
              Создать первый домен
            </button>
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

const inp: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  color: "var(--color-text-primary)",
  background: "var(--color-background-secondary)",
  border: "1px solid var(--color-background-lower)",
  borderRadius: "var(--radius-m)",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 18px",
  background: "var(--brand-blue)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-l)",
  fontFamily: "MTS Compact",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const iconBtn: React.CSSProperties = {
  padding: "4px 8px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  borderRadius: "var(--radius-s)",
  color: "var(--color-text-secondary)",
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
