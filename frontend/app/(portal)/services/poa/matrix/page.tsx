"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, LinkButton } from "@/components/ui";
import {
  useAuthorities, useOrgScopes, useMatrix, useUpsertCell, useDeleteCell, useRegenerate,
} from "@/lib/api/poa";

function cellKey(authId: number, scopeId: number | null) {
  return `${authId}:${scopeId ?? "all"}`;
}

export default function PoaMatrixPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";

  const authorities = useAuthorities();
  const scopes = useOrgScopes();
  const matrix = useMatrix();
  const upsert = useUpsertCell();
  const del = useDeleteCell();
  const regen = useRegenerate();
  const [pending, setPending] = useState<string | null>(null);

  const activeAuths = useMemo(
    () => (authorities.data ?? []).filter((a) => a.status === "active"),
    [authorities.data]
  );
  const scopeList = scopes.data ?? [];

  const grantMap = useMemo(() => {
    const m = new Map<string, boolean>(); // key → granted
    for (const g of matrix.data ?? []) m.set(cellKey(g.authority_id, g.org_scope_id), g.granted);
    return m;
  }, [matrix.data]);

  const toggle = async (authId: number, scopeId: number | null) => {
    if (!canEdit) return;
    const key = cellKey(authId, scopeId);
    const granted = grantMap.get(key) === true;
    setPending(key);
    try {
      if (granted) await del.mutateAsync({ authority_id: authId, org_scope_id: scopeId ?? undefined });
      else await upsert.mutateAsync({ authority_id: authId, org_scope_id: scopeId ?? null, granted: true });
    } finally {
      setPending(null);
    }
  };

  const loading = authorities.isLoading || scopes.isLoading || matrix.isLoading;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Матрица</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "8px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            Матрица доступности
          </h1>
          <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
            Полномочие × подразделение. Наследуется вниз по оргструктуре. Клик по ячейке — выдать/снять.
          </p>
        </div>
        {canEdit && (
          <Button variant="secondary" size="s" disabled={regen.isPending}
            onClick={() => regen.mutateAsync()} icon={<Icon name="UpdateSize24StyleOutline" size={16} />}>
            {regen.isPending ? "Пересчёт…" : "Пересчитать"}
          </Button>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", margin: "16px 0", alignItems: "center" }}>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-accent-warning-bg)", border: "1px solid var(--color-accent-warning)" }} /> Выдано</span>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)" }} /> Недоступно</span>
        <span style={legendItem}>Столбец «Все» — полномочие во всех подразделениях</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : activeAuths.length === 0 || scopeList.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          Нужны активные полномочия и подразделения. Заведите их в{" "}
          <LinkButton onClick={() => router.push("/services/poa/catalog")}>каталоге</LinkButton>.
        </p>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid var(--color-line)", borderRadius: "var(--radius-m)" }}>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...th, ...stickyLeft, textAlign: "left", minWidth: "260px" }}>Полномочие</th>
                <th style={th}>Все</th>
                {scopeList.map((s) => (
                  <th key={s.id} style={th} title={s.name}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeAuths.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...td, ...stickyLeft, textAlign: "left" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{a.code}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "240px" }}>
                      {a.name_short}
                    </span>
                  </td>
                  {[null, ...scopeList.map((s) => s.id)].map((scopeId) => {
                    const key = cellKey(a.id, scopeId);
                    const granted = grantMap.get(key) === true;
                    const busy = pending === key;
                    return (
                      <td key={key} style={td}>
                        <button
                          type="button"
                          onClick={() => toggle(a.id, scopeId)}
                          disabled={!canEdit || busy}
                          aria-label={granted ? "Снять" : "Выдать"}
                          style={{
                            width: "28px", height: "28px", borderRadius: "var(--radius-s)",
                            cursor: canEdit ? "pointer" : "default",
                            border: granted ? "1px solid var(--color-accent-warning)" : "1px solid var(--color-background-lower)",
                            background: granted ? "var(--color-accent-warning-bg)" : "var(--color-background-secondary)",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            transition: "background var(--duration-fast) var(--ease-standard)",
                          }}
                        >
                          {busy ? <Spinner size={16} /> : granted ? (
                            <Icon name="CheckSize24StyleOutline" size={14} />
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 8px", fontFamily: "MTS Compact, sans-serif", fontSize: "11px", fontWeight: 500,
  color: "var(--color-text-secondary)", background: "var(--color-background-secondary)",
  borderBottom: "1px solid var(--color-line)", whiteSpace: "nowrap", textAlign: "center",
  position: "sticky", top: 0,
};
const td: React.CSSProperties = {
  padding: "6px 8px", borderBottom: "1px solid var(--color-line)", textAlign: "center",
  fontFamily: "MTS Compact, sans-serif", background: "var(--color-background-primary)",
};
const stickyLeft: React.CSSProperties = {
  position: "sticky", left: 0, zIndex: 1,
  boxShadow: "1px 0 0 var(--color-line)",
};
const legendItem: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-secondary)",
};
const swatch: React.CSSProperties = {
  width: "16px", height: "16px", borderRadius: "var(--radius-s)", display: "inline-block",
};
