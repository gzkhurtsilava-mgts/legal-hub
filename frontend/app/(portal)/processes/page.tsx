"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useLandscape, type PmLandscapeDomain } from "@/lib/api/processes";

function DomainCard({ domain }: { domain: PmLandscapeDomain }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/processes/domains/${domain.id}`)}
      style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--radius-m)",
        border: "1px solid var(--color-background-lower)",
        padding: "18px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-low)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {domain.name}
        </p>
        {domain.mission && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {domain.mission}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "16px", flexShrink: 0, alignItems: "center" }}>
        {domain.workflow_count > 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--brand-blue)", margin: 0 }}>{domain.workflow_count}</p>
            <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: 0 }}>процедур</p>
          </div>
        )}
        {domain.service_count > 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--brand-blue)", margin: 0 }}>{domain.service_count}</p>
            <p style={{ fontFamily: "MTS Compact", fontSize: "11px", color: "var(--color-text-tertiary)", margin: 0 }}>услуг</p>
          </div>
        )}
        {domain.process_count === 0 && (
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>Пусто</p>
        )}
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "16px" }}>›</span>
      </div>
    </div>
  );
}

export default function ProcessesLandscapePage() {
  const router = useRouter();
  const { data, isLoading, error } = useLandscape();
  const [search, setSearch] = useState("");

  const domains = (data?.domains ?? []).filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "26px", color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            Карта процессов
          </h1>
          {data && (
            <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
              {data.total_domains} {plural(data.total_domains, "домен", "домена", "доменов")}
              {data.total_processes > 0 && ` · ${data.total_processes} процессов и услуг`}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push("/processes/edit")}
          style={{
            padding: "8px 18px",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            border: "none",
            borderRadius: "var(--radius-l)",
            fontFamily: "MTS Compact",
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Редактировать
        </button>
      </div>

      {/* Search */}
      {(data?.domains.length ?? 0) > 4 && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по доменам…"
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "8px 12px",
              fontFamily: "MTS Compact",
              fontSize: "13px",
              color: "var(--color-text-primary)",
              background: "var(--color-background-primary)",
              border: "1px solid var(--color-background-lower)",
              borderRadius: "var(--radius-m)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* List */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Spinner size={44} />
        </div>
      )}

      {error && (
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>Ошибка загрузки</p>
      )}

      {!isLoading && domains.length === 0 && !search && (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "var(--color-background-primary)", borderRadius: "var(--radius-m)" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--color-text-secondary)", margin: "0 0 8px" }}>
            Домены ещё не добавлены
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", margin: "0 0 20px" }}>
            Создайте первый домен в разделе редактирования
          </p>
          <button
            onClick={() => router.push("/processes/edit/domains/new")}
            style={{ padding: "10px 24px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", cursor: "pointer" }}
          >
            Создать домен
          </button>
        </div>
      )}

      {!isLoading && domains.length === 0 && search && (
        <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)" }}>
          Ничего не найдено
        </p>
      )}

      {domains.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {domains.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
}
