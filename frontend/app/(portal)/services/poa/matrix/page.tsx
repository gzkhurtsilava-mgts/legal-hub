"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Badge, Button, Checkbox, LinkButton, PageHeader, Select } from "@/components/ui";
import {
  useAuthorities, useCategories, useDeleteCell, useMatrix, useOrgScopes,
  useRegenerate, useUpsertCell,
} from "@/lib/api/poa";
import type { Authority, OrgScope } from "@/lib/api/poa";
import { buildAuthorityGroups } from "@/lib/poa-groups";

// ─── Вспомогательные структуры ────────────────────────────────────────────────

function cellKey(authId: number, scopeId: number | null) {
  return `${authId}:${scopeId ?? "all"}`;
}

interface ScopeNode {
  scope: OrgScope;
  depth: number;
}

/** Дерево оргструктуры в плоский DFS-список с глубиной (для колонок и селекта). */
function flattenScopes(scopes: OrgScope[]): ScopeNode[] {
  const children = new Map<number | null, OrgScope[]>();
  for (const s of scopes) {
    const arr = children.get(s.parent_id) ?? [];
    arr.push(s);
    children.set(s.parent_id, arr);
  }
  const out: ScopeNode[] = [];
  const walk = (parent: number | null, depth: number) => {
    for (const s of children.get(parent) ?? []) {
      out.push({ scope: s, depth });
      walk(s.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** Состояние ячейки с учётом наследования по оргдереву. */
type CellState =
  | { kind: "universal" }
  | { kind: "explicit"; granted: boolean }
  | { kind: "inherited"; granted: boolean; from: string }
  | { kind: "global"; granted: boolean } // грант «во всех подразделениях» (scope = null)
  | { kind: "empty" };

// ─── Страница ─────────────────────────────────────────────────────────────────

export default function PoaMatrixPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";

  const authorities = useAuthorities();
  const categories = useCategories();
  const scopes = useOrgScopes();
  const matrix = useMatrix();
  const upsert = useUpsertCell();
  const del = useDeleteCell();
  const regen = useRegenerate();

  const [pending, setPending] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [focusId, setFocusId] = useState<number | null>(null);
  const [grantedOnly, setGrantedOnly] = useState(false);
  // "all" = все группы свёрнуты (стартовое состояние); Set — id свёрнутых групп
  const [collapsed, setCollapsed] = useState<Set<number> | "all">("all");

  const activeAuths = useMemo(
    () => (authorities.data ?? []).filter((a) => a.status === "active"),
    [authorities.data]
  );
  const tree = useMemo(() => flattenScopes(scopes.data ?? []), [scopes.data]);
  const scopeById = useMemo(
    () => new Map((scopes.data ?? []).map((s) => [s.id, s])),
    [scopes.data]
  );

  const grantMap = useMemo(() => {
    const m = new Map<string, boolean>(); // key → granted
    for (const g of matrix.data ?? []) m.set(cellKey(g.authority_id, g.org_scope_id), g.granted);
    return m;
  }, [matrix.data]);

  /** Эффективное состояние ячейки: сам узел → предки → «Все» → универсальное. */
  const stateFor = (a: Authority, scopeId: number | null): CellState => {
    if (a.is_universal) return { kind: "universal" };
    if (scopeId === null) {
      const own = grantMap.get(cellKey(a.id, null));
      return own === undefined ? { kind: "empty" } : { kind: "explicit", granted: own };
    }
    const own = grantMap.get(cellKey(a.id, scopeId));
    if (own !== undefined) return { kind: "explicit", granted: own };
    let cur = scopeById.get(scopeId)?.parent_id ?? null;
    let hops = 0;
    while (cur !== null && hops <= tree.length) {
      const g = grantMap.get(cellKey(a.id, cur));
      if (g !== undefined) {
        return { kind: "inherited", granted: g, from: scopeById.get(cur)?.name ?? "" };
      }
      cur = scopeById.get(cur)?.parent_id ?? null;
      hops += 1;
    }
    const global = grantMap.get(cellKey(a.id, null));
    if (global !== undefined) return { kind: "global", granted: global };
    return { kind: "empty" };
  };

  // Колонки: фокус-режим — предки + узел + прямые дети; иначе всё дерево.
  const columns = useMemo<ScopeNode[]>(() => {
    if (focusId === null) return tree;
    const chain: OrgScope[] = [];
    let cur = scopeById.get(focusId);
    while (cur) {
      chain.unshift(cur);
      cur = cur.parent_id != null ? scopeById.get(cur.parent_id) : undefined;
    }
    const kids = (scopes.data ?? []).filter((s) => s.parent_id === focusId);
    return [...chain, ...kids].map((s, i) => ({
      scope: s,
      depth: i < chain.length ? i : chain.length,
    }));
  }, [focusId, tree, scopeById, scopes.data]);

  // Фильтрация строк: поиск + «только с грантами» (в видимых колонках).
  const q = search.trim().toLowerCase();
  const visibleAuths = useMemo(() => {
    return activeAuths.filter((a) => {
      if (q && !`${a.code} ${a.name_short}`.toLowerCase().includes(q)) return false;
      if (!grantedOnly) return true;
      if (a.is_universal) return true;
      if (grantMap.get(cellKey(a.id, null)) === true) return true;
      return columns.some((c) => {
        const st = stateFor(a, c.scope.id);
        return st.kind !== "empty" && !(("granted" in st) && st.granted === false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAuths, q, grantedOnly, grantMap, columns, scopeById]);

  const groups = useMemo(
    () => buildAuthorityGroups(categories.data ?? [], visibleAuths),
    [categories.data, visibleAuths]
  );
  const allGroupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  const isCollapsed = (id: number) => {
    if (q) return false; // при поиске всё раскрыто
    return collapsed === "all" ? true : collapsed.has(id);
  };
  const toggleGroup = (id: number) => {
    setCollapsed((prev) => {
      const set = prev === "all" ? new Set(allGroupIds) : new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return set;
    });
  };

  const toggle = async (a: Authority, scopeId: number | null) => {
    if (!canEdit || a.is_universal) return;
    const key = cellKey(a.id, scopeId);
    const st = stateFor(a, scopeId);
    setPending(key);
    try {
      if (st.kind === "explicit" && st.granted) {
        // Явный грант → явный запрет (исключение для узла при гранте у предка).
        await upsert.mutateAsync({ authority_id: a.id, org_scope_id: scopeId, granted: false });
      } else if (st.kind === "explicit") {
        // Явный запрет → снять ячейку (вернуть наследование).
        await del.mutateAsync({ authority_id: a.id, org_scope_id: scopeId ?? undefined });
      } else {
        // Пустая/унаследованная — клик создаёт явный грант на этом узле.
        await upsert.mutateAsync({ authority_id: a.id, org_scope_id: scopeId, granted: true });
      }
    } finally {
      setPending(null);
    }
  };

  const loading =
    authorities.isLoading || scopes.isLoading || matrix.isLoading || categories.isLoading;
  const nCols = columns.length + 2; // «Полномочие» + «Все» + подразделения

  return (
    <div style={{ padding: "32px 24px", maxWidth: focusId === null ? "1400px" : "1100px", margin: "0 auto" }}>
      <PageHeader
        crumbs={[
          { label: "Доверенности", onClick: () => router.push("/services/poa") },
          { label: "Матрица" },
        ]}
        title="Матрица доступности"
        subtitle="Полномочие × подразделение. Гранты наследуются вниз по оргструктуре. Клик по ячейке: выдать → запретить → снять."
        actions={
          canEdit && (
            <Button variant="secondary" size="s" disabled={regen.isPending}
              onClick={() => regen.mutateAsync()} icon={<Icon name="UpdateSize24StyleOutline" size={16} />}>
              {regen.isPending ? "Пересчёт…" : "Пересчитать"}
            </Button>
          )
        }
      />

      {/* Панель управления */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ position: "relative", width: "260px" }}>
          <Icon name="SearchSize24StyleOutline" size={16}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-icons-secondary)" }} />
          <input
            className="ui-input"
            style={{ paddingLeft: "36px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Код или название полномочия"
          />
        </div>
        <Select
          style={{ width: "300px" }}
          value={focusId ?? ""}
          placeholder="Все подразделения"
          onChange={(e) => setFocusId(e.target.value === "" ? null : Number(e.target.value))}
          options={[
            { value: "", label: "Все подразделения" },
            ...tree.map((n) => ({
              value: n.scope.id,
              label: `${" ".repeat(n.depth * 3)}${n.scope.name}`,
            })),
          ]}
        />
        <Checkbox checked={grantedOnly} onChange={setGrantedOnly} label="Только с грантами" />
        <span style={{ flex: 1 }} />
        <LinkButton onClick={() => setCollapsed(new Set())}>Развернуть всё</LinkButton>
        <LinkButton onClick={() => setCollapsed("all")}>Свернуть всё</LinkButton>
      </div>

      {focusId !== null && (
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge tone="brand">{scopeById.get(focusId)?.name}</Badge>
          <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-secondary)" }}>
            показаны цепочка наследования и дочерние узлы
          </span>
          <LinkButton onClick={() => setFocusId(null)}>Сбросить</LinkButton>
        </div>
      )}

      {/* Легенда */}
      <div style={{ display: "flex", gap: "16px", margin: "0 0 16px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-accent-warning-bg)", border: "1px solid var(--color-accent-warning)" }} /> Выдано</span>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-background-primary)", border: "1px dashed var(--color-accent-warning)" }} /> Унаследовано</span>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-accent-negative-bg)", border: "1px solid var(--color-accent-negative)" }} /> Запрет</span>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-accent-brand-bg)", border: "1px solid transparent" }} /> Универсальное</span>
        <span style={legendItem}><span style={{ ...swatch, background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)" }} /> Недоступно</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size={24} /></div>
      ) : activeAuths.length === 0 || tree.length === 0 ? (
        <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-tertiary)", padding: "16px 0" }}>
          Нужны активные полномочия и подразделения. Заведите их в{" "}
          <LinkButton onClick={() => router.push("/services/poa/catalog")}>каталоге</LinkButton>.
        </p>
      ) : (
        <div style={{ overflow: "auto", maxHeight: "calc(100vh - 320px)", border: "1px solid var(--color-line)", borderRadius: "var(--radius-m)" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...th, ...stickyLeft, zIndex: 3, textAlign: "left", minWidth: "280px" }}>Полномочие</th>
                <th style={{ ...th, minWidth: "56px" }} title="Грант во всех подразделениях">Все</th>
                {columns.map((c) => (
                  <th key={c.scope.id} style={{ ...th, minWidth: "88px", maxWidth: "140px", whiteSpace: "normal" }}>
                    <button
                      type="button"
                      onClick={() => setFocusId(focusId === c.scope.id ? null : c.scope.id)}
                      title={focusId === c.scope.id ? "Сбросить фокус" : `Показать только «${c.scope.name}»`}
                      style={{
                        border: "none", background: "none", cursor: "pointer", padding: 0,
                        font: "inherit", lineHeight: 1.3,
                        color: focusId === c.scope.id ? "var(--brand-blue)" : "inherit",
                        fontWeight: focusId === c.scope.id ? 700 : 500,
                      }}
                    >
                      {c.scope.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr>
                  <td colSpan={nCols} style={{ ...td, textAlign: "center", color: "var(--color-text-tertiary)", padding: "24px" }}>
                    Ничего не найдено
                  </td>
                </tr>
              )}
              {groups.map((g) => (
                <GroupRows
                  key={g.id}
                  group={g}
                  nCols={nCols}
                  collapsed={isCollapsed(g.id)}
                  onToggle={() => toggleGroup(g.id)}
                  renderRow={(a) => (
                    <tr key={a.id}>
                      <td style={{ ...td, ...stickyLeft, textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-primary)" }}>{a.code}</span>
                            <span
                              title={a.name_short}
                              style={{ display: "block", fontSize: "11px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "240px" }}
                            >
                              {a.name_short}
                            </span>
                          </div>
                          {a.is_universal && <Badge tone="brand">универс.</Badge>}
                        </div>
                      </td>
                      {[null, ...columns.map((c) => c.scope.id)].map((scopeId) => {
                        const key = cellKey(a.id, scopeId);
                        const st = stateFor(a, scopeId);
                        const busy = pending === key;
                        return (
                          <td key={key} style={td}>
                            <Cell
                              state={st}
                              busy={busy}
                              disabled={!canEdit || a.is_universal}
                              onClick={() => toggle(a, scopeId)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  )}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Ячейка ───────────────────────────────────────────────────────────────────

function Cell({
  state, busy, disabled, onClick,
}: {
  state: CellState;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    width: "26px", height: "26px", borderRadius: "var(--radius-s)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "default" : "pointer",
    transition: "background var(--duration-fast) var(--ease-standard)",
  };
  let style: React.CSSProperties;
  let icon: React.ReactNode = null;
  let title = "";

  switch (state.kind) {
    case "universal":
      style = { ...base, background: "var(--color-accent-brand-bg)", border: "1px solid transparent", cursor: "default" };
      icon = <Icon name="CheckSize24StyleOutline" size={13} style={{ color: "var(--color-text-brand)" }} />;
      title = "Универсальное полномочие — доступно во всех подразделениях";
      break;
    case "explicit":
      style = state.granted
        ? { ...base, background: "var(--color-accent-warning-bg)", border: "1px solid var(--color-accent-warning)" }
        : { ...base, background: "var(--color-accent-negative-bg)", border: "1px solid var(--color-accent-negative)" };
      icon = state.granted
        ? <Icon name="CheckSize24StyleOutline" size={13} />
        : <Icon name="CrossSize24StyleOutline" size={13} style={{ color: "var(--color-accent-negative)" }} />;
      title = state.granted ? "Выдано (клик — запретить)" : "Явный запрет (клик — снять)";
      break;
    case "inherited":
      style = state.granted
        ? { ...base, background: "var(--color-background-primary)", border: "1px dashed var(--color-accent-warning)" }
        : { ...base, background: "var(--color-background-primary)", border: "1px dashed var(--color-accent-negative)" };
      icon = state.granted
        ? <Icon name="CheckSize24StyleOutline" size={13} style={{ opacity: 0.55 }} />
        : <Icon name="CrossSize24StyleOutline" size={13} style={{ color: "var(--color-accent-negative)", opacity: 0.55 }} />;
      title = state.granted
        ? `Унаследовано от «${state.from}» (клик — явный грант на этом узле)`
        : `Запрет унаследован от «${state.from}» (клик — явный грант на этом узле)`;
      break;
    case "global":
      style = { ...base, background: "var(--color-background-primary)", border: "1px dashed var(--color-accent-warning)" };
      icon = <Icon name="CheckSize24StyleOutline" size={13} style={{ opacity: 0.55 }} />;
      title = "Грант «во всех подразделениях» (клик — явный грант на этом узле)";
      break;
    default:
      style = { ...base, background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)" };
      title = "Недоступно (клик — выдать)";
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} aria-label={title} title={title} style={style}>
      {busy ? <Spinner size={16} /> : icon}
    </button>
  );
}

// ─── Группа строк ─────────────────────────────────────────────────────────────

function GroupRows({
  group, nCols, collapsed, onToggle, renderRow,
}: {
  group: { id: number; title: string; items: Authority[] };
  nCols: number;
  collapsed: boolean;
  onToggle: () => void;
  renderRow: (a: Authority) => React.ReactNode;
}) {
  return (
    <>
      <tr>
        <td colSpan={nCols} style={{ padding: 0, position: "sticky", left: 0 }}>
          <button
            type="button"
            onClick={onToggle}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%",
              padding: "8px 12px", border: "none", cursor: "pointer", textAlign: "left",
              background: "var(--color-background-secondary)",
              borderBottom: "1px solid var(--color-line)",
              fontFamily: "MTS Compact, sans-serif", fontSize: "12px", fontWeight: 700,
              color: "var(--color-text-primary)", position: "sticky", left: 0, maxWidth: "100vw",
            }}
          >
            <Icon
              name="ArrowDownSize24StyleOutline"
              size={14}
              style={{
                transform: collapsed ? "rotate(-90deg)" : "none",
                transition: "transform var(--duration-fast) var(--ease-standard)",
                color: "var(--color-icons-secondary)", flexShrink: 0,
              }}
            />
            {group.title}
            <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>{group.items.length}</span>
          </button>
        </td>
      </tr>
      {!collapsed && group.items.map(renderRow)}
    </>
  );
}

// ─── Стили ────────────────────────────────────────────────────────────────────

const th: React.CSSProperties = {
  padding: "10px 8px", fontFamily: "MTS Compact, sans-serif", fontSize: "11px", fontWeight: 500,
  color: "var(--color-text-secondary)", background: "var(--color-background-secondary)",
  borderBottom: "1px solid var(--color-line)", textAlign: "center",
  position: "sticky", top: 0, zIndex: 2,
};
const td: React.CSSProperties = {
  padding: "4px 8px", borderBottom: "1px solid var(--color-line)", textAlign: "center",
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
  width: "14px", height: "14px", borderRadius: "4px", display: "inline-block", boxSizing: "border-box",
};
