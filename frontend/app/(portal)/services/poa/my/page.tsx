"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, LinkButton, Badge } from "@/components/ui";
import { useMyCertificates, useMyRequests } from "@/lib/api/poa";

const CERT_TYPE: Record<string, string> = { paper: "Бумажная", notarial: "Нотариальная", mchd: "МЧД" };
const CERT_STATUS: Record<string, string> = { active: "Действует", revoked: "Отозвана", expired: "Истекла" };
const CERT_TONE: Record<string, "positive" | "negative" | "neutral"> = {
  active: "positive", revoked: "negative", expired: "neutral",
};
const REQ_STATUS: Record<string, string> = { pending: "На рассмотрении", approved: "Одобрена", rejected: "Отклонена" };
const REQ_TONE: Record<string, "warning" | "positive" | "negative"> = {
  pending: "warning", approved: "positive", rejected: "negative",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function PoaMyPage() {
  const router = useRouter();
  const certs = useMyCertificates();
  const reqs = useMyRequests();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "820px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Мои доверенности</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 24px" }}>
        Мои доверенности
      </h1>

      {/* Доверенности */}
      <h2 style={h2}>Выданные</h2>
      {certs.isLoading ? (
        <div style={{ padding: "24px" }}><Spinner size={24} /></div>
      ) : (certs.data ?? []).length === 0 ? (
        <div style={emptyCard}>
          У вас пока нет выданных доверенностей.{" "}
          <LinkButton onClick={() => router.push("/services/poa/navigator")}>Оформить</LinkButton>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
          {(certs.data ?? []).map((c) => (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  № {c.number}
                </span>
                <Badge tone={CERT_TONE[c.status]}>{CERT_STATUS[c.status]}</Badge>
                <span style={meta}>{CERT_TYPE[c.cert_type]}</span>
                <span style={meta}>выдана {fmtDate(c.issued_date)}</span>
                {c.valid_to && <span style={meta}>действует до {fmtDate(c.valid_to)}</span>}
              </div>
              {c.authorities.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {c.authorities.map((a) => <Badge key={a.id} tone="brand">{a.name_short}</Badge>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Заявки */}
      <h2 style={h2}>Мои заявки на полномочия</h2>
      {reqs.isLoading ? (
        <div style={{ padding: "24px" }}><Spinner size={24} /></div>
      ) : (reqs.data ?? []).length === 0 ? (
        <div style={emptyCard}>Заявок нет.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(reqs.data ?? []).map((r) => (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-primary)" }}>
                  {r.authority_name ?? r.proposed_text ?? "—"}
                </span>
                <Badge tone={REQ_TONE[r.status]}>{REQ_STATUS[r.status]}</Badge>
                <span style={meta}>от {fmtDate(r.created_at.slice(0, 10))}</span>
              </div>
              {r.justification && <p style={{ ...meta, marginTop: "6px" }}>{r.justification}</p>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "32px" }}>
        <Button variant="secondary" onClick={() => router.push("/services/poa/navigator")}
          icon={<Icon name="CatalogSearchSize24StyleOutline" size={16} />}>
          Оформить новую доверенность
        </Button>
      </div>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontFamily: "MTS Compact, sans-serif", fontSize: "13px", fontWeight: 500,
  color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em",
  margin: "0 0 12px",
};
const card: React.CSSProperties = {
  background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-background-lower)", padding: "16px",
};
const emptyCard: React.CSSProperties = {
  background: "var(--color-background-primary)", borderRadius: "var(--radius-m)",
  border: "1px solid var(--color-line)", padding: "20px", marginBottom: "32px",
  fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)",
};
const meta: React.CSSProperties = {
  fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-secondary)",
};
