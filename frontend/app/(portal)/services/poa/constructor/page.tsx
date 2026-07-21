"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Tooltip } from "@mts-ds/granat2-react-tooltip";
import { CrossIcon, Icon, InfoIcon } from "@/components/icons";
import {
  Badge, Button, Checkbox, IconButton, LinkButton, PageHeader, SegmentedControl, Select,
} from "@/components/ui";
import {
  useAuthorities, useCategories, useEmployees, useOrgScopes, useRenderDocument,
  useResolve, useTemplates,
} from "@/lib/api/poa";
import type { Employee } from "@/lib/api/poa";
import { buildAuthorityGroups } from "@/lib/poa-groups";

const TEMPLATE_LABEL: Record<string, string> = { mgts_default: "Доверенность МГТС" };
const MANUAL = "manual";
const PASSPORT_HINT =
  "паспорт 4500 123456, выдан ОВД района Беговой г. Москвы 01.01.2010, код подразделения 770-001";

interface GranteeRow {
  key: number;
  employeeId: string; // id сотрудника | MANUAL | ""
  manualFio: string;
  passport: string;
}

export default function PoaConstructorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";

  const templates = useTemplates();
  const authorities = useAuthorities();
  const categories = useCategories();
  const employees = useEmployees();
  const scopes = useOrgScopes();
  const render = useRenderDocument();

  const [template, setTemplate] = useState("mgts_default");
  const [rows, setRows] = useState<GranteeRow[]>([
    { key: 1, employeeId: "", manualFio: "", passport: "" },
  ]);
  const nextKey = useRef(2);
  const [validity, setValidity] = useState("");
  const [output, setOutput] = useState("docx");
  const [picked, setPicked] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  // "all" = все группы свёрнуты; Set — id свёрнутых групп
  const [collapsed, setCollapsed] = useState<Set<number> | "all">("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const active = useMemo(
    () => (authorities.data ?? []).filter((a) => a.status === "active"),
    [authorities.data]
  );
  const employeeById = useMemo(
    () => new Map((employees.data ?? []).map((e) => [String(e.id), e])),
    [employees.data]
  );
  const scopeName = (e: Employee | undefined) =>
    e?.org_scope_id ? (scopes.data ?? []).find((s) => s.id === e.org_scope_id)?.name : null;

  const updateRow = (key: number, patch: Partial<GranteeRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((rs) => [...rs, { key: nextKey.current++, employeeId: "", manualFio: "", passport: "" }]);
  const removeRow = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));

  const rowFio = (r: GranteeRow) =>
    r.employeeId === MANUAL
      ? r.manualFio.trim()
      : (employeeById.get(r.employeeId)?.fio ?? "");

  // Пул по матрице — по первому выбранному сотруднику (групповые доверенности
  // обычно выдаются людям одной вертикали, пул у них общий).
  const firstEmployee = useMemo(() => {
    for (const r of rows) {
      const e = employeeById.get(r.employeeId);
      if (e) return e;
    }
    return null;
  }, [rows, employeeById]);
  const resolve = useResolve(firstEmployee ? firstEmployee.id : null);
  const resolvedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of resolve.data?.authorities ?? []) {
      if (r.authority_id != null && r.granted) ids.add(r.authority_id);
    }
    return ids;
  }, [resolve.data]);

  // Группировка полномочий + поиск.
  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? active.filter((a) => `${a.code} ${a.name_short}`.toLowerCase().includes(q)) : active),
    [active, q]
  );
  const groups = useMemo(
    () => buildAuthorityGroups(categories.data ?? [], filtered),
    [categories.data, filtered]
  );
  const allGroupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  const isCollapsed = (id: number) => {
    if (q) return false; // при поиске всё раскрыто
    return collapsed === "all" ? true : collapsed.has(id);
  };
  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const set = prev === "all" ? new Set(allGroupIds) : new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return set;
    });
  };

  const togglePick = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /** Чекбокс группы: выбрать/снять все полномочия группы разом. */
  const toggleGroupPick = (ids: number[]) => {
    setPicked((p) => {
      const all = ids.every((id) => p.includes(id));
      if (all) return p.filter((x) => !ids.includes(x));
      const missing = ids.filter((id) => !p.includes(id));
      return [...p, ...missing];
    });
  };

  const pickResolved = () => {
    setPicked((p) => {
      const add = active.filter((a) => resolvedIds.has(a.id) && !p.includes(a.id)).map((a) => a.id);
      return [...p, ...add];
    });
  };

  const submit = async () => {
    const grantees = rows.map((r) => ({ fio: rowFio(r), passport: r.passport.trim() }));
    if (grantees.some((g) => !g.fio)) {
      setError("Укажите каждого поверенного (или удалите пустую строку)");
      return;
    }
    if (picked.length === 0) { setError("Выберите хотя бы одно полномочие"); return; }
    setError("");
    setBusy(true);
    try {
      await render({
        grantees, validity,
        authority_ids: picked, template, output: output as "docx" | "pdf",
      });
    } catch (e) {
      setError((e as Error)?.message ?? "Ошибка генерации");
    } finally {
      setBusy(false);
    }
  };

  if (!canEdit) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: "720px", margin: "0 auto", fontFamily: "MTS Compact, sans-serif", color: "var(--color-text-secondary)" }}>
        Конструктор доступен юристам БПО.
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "860px", margin: "0 auto" }}>
      <PageHeader
        crumbs={[
          { label: "Доверенности", onClick: () => router.push("/services/poa") },
          { label: "Конструктор" },
        ]}
        title="Конструктор доверенностей"
        subtitle="Заполните форму — получите готовый документ по шаблону без правки стилей. ФИО поверенных в тексте склоняются автоматически."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={lbl}>Шаблон</label>
            <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
              {(templates.data ?? ["mgts_default"]).map((t) => (
                <option key={t} value={t}>{TEMPLATE_LABEL[t] ?? t}</option>
              ))}
            </Select>
          </div>
          <div>
            <label style={lbl}>Срок действия</label>
            <input
              className="ui-input"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              placeholder="до 31.12.2026 / на 1 год"
            />
          </div>
        </div>

        {/* Поверенные (мультивыбор для групповых доверенностей) */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <label style={{ ...lbl, marginBottom: 0 }}>
              Поверенные{rows.length > 1 ? ` (${rows.length})` : ""} *
            </label>
            <span style={{ flex: 1 }} />
            <LinkButton onClick={addRow}>+ Добавить поверенного</LinkButton>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rows.map((row, idx) => {
              const employee = employeeById.get(row.employeeId);
              const usedElsewhere = new Set(
                rows.filter((r) => r.key !== row.key).map((r) => r.employeeId)
              );
              return (
                <div
                  key={row.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    // Разделитель между поверенными; поля — по общей левой линии.
                    borderTop: idx > 0 ? "1px solid var(--color-line)" : "none",
                    paddingTop: idx > 0 ? "14px" : 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        value={row.employeeId}
                        placeholder={employees.isLoading ? "Загрузка…" : "Выберите сотрудника"}
                        onChange={(e) => updateRow(row.key, { employeeId: e.target.value })}
                        options={[
                          ...(employees.data ?? [])
                            .filter((emp) => !usedElsewhere.has(String(emp.id)))
                            .map((emp) => ({
                              value: emp.id,
                              label: emp.position ? `${emp.fio} — ${emp.position}` : emp.fio,
                            })),
                          { value: MANUAL, label: "Ввести вручную…" },
                        ]}
                      />
                    </div>
                    {rows.length > 1 && (
                      <IconButton label={`Удалить поверенного ${idx + 1}`} danger
                        onClick={() => removeRow(row.key)}>
                        <CrossIcon size={16} />
                      </IconButton>
                    )}
                  </div>

                  {employee && (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      {scopeName(employee) && <Badge tone="neutral">{scopeName(employee)}</Badge>}
                      {employee.tab_number && <Badge tone="neutral">таб. № {employee.tab_number}</Badge>}
                      <Badge tone="neutral">{employee.company}</Badge>
                    </div>
                  )}
                  {row.employeeId === MANUAL && (
                    <input
                      className="ui-input"
                      value={row.manualFio}
                      onChange={(e) => updateRow(row.key, { manualFio: e.target.value })}
                      placeholder="Фамилия Имя Отчество (в именительном падеже)"
                    />
                  )}

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <label style={{ ...lbl, marginBottom: 0 }}>Паспортные данные</label>
                      <Tooltip text={`Формат: ${PASSPORT_HINT}`} placement="top" zIndex={50}>
                        <span
                          tabIndex={0}
                          aria-label="Формат заполнения паспортных данных"
                          style={{ display: "inline-flex", color: "var(--color-icons-secondary)", cursor: "help" }}
                        >
                          <InfoIcon size={15} />
                        </span>
                      </Tooltip>
                    </div>
                    <textarea
                      className="ui-textarea"
                      rows={2}
                      value={row.passport}
                      onChange={(e) => updateRow(row.key, { passport: e.target.value })}
                      placeholder={PASSPORT_HINT}
                    />
                    <p style={hint}>
                      Формат: серия и номер, кем и когда выдан, код подразделения — как в паспорте.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Полномочия */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
            <label style={{ ...lbl, marginBottom: 0 }}>
              Полномочия ({picked.length}) — попадут в документ в порядке выбора
            </label>
            <span style={{ flex: 1 }} />
            {firstEmployee && resolvedIds.size > 0 && (
              <LinkButton onClick={pickResolved}
                title={`Полномочия, доступные по матрице сотруднику: ${firstEmployee.fio}`}>
                Отметить доступные по матрице ({resolvedIds.size})
              </LinkButton>
            )}
            {picked.length > 0 && (
              <LinkButton onClick={() => setPicked([])}>Сбросить</LinkButton>
            )}
          </div>

          <div style={{ position: "relative", marginBottom: "8px" }}>
            <Icon name="SearchSize24StyleOutline" size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-icons-secondary)" }} />
            <input
              className="ui-input"
              style={{ paddingLeft: "36px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по коду или названию"
            />
          </div>

          <div style={{ maxHeight: "380px", overflowY: "auto", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)", padding: "6px" }}>
            {authorities.isLoading || categories.isLoading ? (
              <div style={{ padding: "12px" }}><Spinner size={16} /></div>
            ) : groups.length === 0 ? (
              <span style={{ display: "block", padding: "12px", fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                {active.length === 0 ? (
                  <>Нет активных полномочий — заведите в{" "}
                    <LinkButton onClick={() => router.push("/services/poa/catalog")}>каталоге</LinkButton></>
                ) : "Ничего не найдено"}
              </span>
            ) : groups.map((g) => {
              const ids = g.items.map((a) => a.id);
              const pickedCount = ids.filter((id) => picked.includes(id)).length;
              const open = !isCollapsed(g.id);
              return (
                <div key={g.id} style={{ marginBottom: "2px" }}>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px",
                      borderRadius: "var(--radius-s)", background: "var(--color-background-primary)",
                    }}
                  >
                    <Checkbox
                      checked={pickedCount === ids.length && ids.length > 0}
                      indeterminate={pickedCount > 0 && pickedCount < ids.length}
                      onChange={() => toggleGroupPick(ids)}
                    />
                    <button
                      type="button"
                      onClick={() => toggleCollapse(g.id)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", gap: "8px",
                        border: "none", background: "none", cursor: "pointer", padding: 0, textAlign: "left",
                        fontFamily: "MTS Compact, sans-serif", fontSize: "13px", fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {g.title}
                      <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                        {pickedCount > 0 ? `${pickedCount} из ${ids.length}` : ids.length}
                      </span>
                      <span style={{ flex: 1 }} />
                      <Icon
                        name="ArrowDownSize24StyleOutline"
                        size={14}
                        style={{
                          transform: open ? "none" : "rotate(-90deg)",
                          transition: "transform var(--duration-fast) var(--ease-standard)",
                          color: "var(--color-icons-secondary)",
                        }}
                      />
                    </button>
                  </div>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "8px 10px 10px 40px" }}>
                      {g.items.map((a) => (
                        <Checkbox
                          key={a.id}
                          checked={picked.includes(a.id)}
                          onChange={() => togglePick(a.id)}
                          label={
                            <span title={a.text_full}>
                              {a.code} · {a.name_short}
                              {firstEmployee && resolvedIds.has(a.id) && (
                                <span title="Доступно по матрице" style={{ color: "var(--brand-blue)", marginLeft: "6px" }}>●</span>
                              )}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <label style={lbl}>Формат</label>
            <SegmentedControl size="s" value={output} onChange={setOutput}
              segments={[{ value: "docx", label: "Word (.docx)" }, { value: "pdf", label: "PDF" }]} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", alignSelf: "flex-end" }}>
            <Button onClick={submit} disabled={busy} icon={<Icon name="DownloadSize24StyleOutline" size={16} />}>
              {busy ? "Формирование…" : "Сформировать"}
            </Button>
            {error && <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-accent-negative)" }}>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block", fontFamily: "MTS Compact, sans-serif", fontSize: "12px",
  fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px",
};
const hint: React.CSSProperties = {
  margin: "4px 0 0", fontFamily: "MTS Compact, sans-serif", fontSize: "11px",
  color: "var(--color-text-tertiary)",
};
