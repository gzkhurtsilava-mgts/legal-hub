"use client";

import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useDomain } from "@/lib/api/processes";

export default function DomainViewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: domain, isLoading, error } = useDomain(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={44} />
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-accent-negative)" }}>
          Домен не найден
        </p>
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          ← Карта процессов
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/processes")} style={linkBtn}>
          Карта процессов
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {domain.name}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1
            style={{
              fontFamily: "MTS Wide",
              fontWeight: 700,
              fontSize: "26px",
              color: "var(--color-text-primary)",
              margin: "0 0 4px",
            }}
          >
            {domain.name}
          </h1>
          <p
            style={{
              fontFamily: "MTS Compact",
              fontSize: "12px",
              color: "var(--color-text-tertiary)",
              margin: 0,
            }}
          >
            ID: {domain.id}
          </p>
        </div>

        <button
          onClick={() => router.push(`/processes/edit/domains/${domain.id}`)}
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

      {/* Description */}
      {domain.mission && (
        <div style={{ ...card, marginBottom: "16px" }}>
          <p style={sectionTitle}>Описание</p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>
            {domain.mission}
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.process_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Всего
          </p>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.workflow_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Процедур
          </p>
        </div>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--brand-blue)", margin: "0 0 4px" }}>
            {domain.service_count}
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", margin: 0 }}>
            Услуг
          </p>
        </div>
      </div>

      {/* Processes placeholder */}
      <div style={{ ...card }}>
        <p style={sectionTitle}>Процессы и услуги домена</p>
        {domain.process_count === 0 ? (
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", margin: 0 }}>
            Процессы будут доступны после создания в разделе редактирования
          </p>
        ) : (
          <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)", margin: 0 }}>
            Просмотр процессов доступен начиная с M1
          </p>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)",
  padding: "16px 20px",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "MTS Wide",
  fontWeight: 700,
  fontSize: "13px",
  color: "var(--color-text-secondary)",
  margin: "0 0 10px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
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
