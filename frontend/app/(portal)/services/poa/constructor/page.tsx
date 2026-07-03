"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button, LinkButton, Select, Checkbox, SegmentedControl } from "@/components/ui";
import { useAuthorities, useTemplates, useRenderDocument } from "@/lib/api/poa";

const TEMPLATE_LABEL: Record<string, string> = { mgts_default: "Доверенность МГТС" };

export default function PoaConstructorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canEdit = role === "admin" || role === "lawyer";

  const templates = useTemplates();
  const authorities = useAuthorities();
  const render = useRenderDocument();
  const active = (authorities.data ?? []).filter((a) => a.status === "active");

  const [template, setTemplate] = useState("mgts_default");
  const [fio, setFio] = useState("");
  const [passport, setPassport] = useState("");
  const [validity, setValidity] = useState("");
  const [output, setOutput] = useState("docx");
  const [picked, setPicked] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!fio) { setError("Укажите ФИО поверенного"); return; }
    setError("");
    setBusy(true);
    try {
      await render({
        grantee_fio: fio, grantee_passport: passport, validity,
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
    <div style={{ padding: "32px 24px", maxWidth: "820px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Конструктор</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 4px" }}>
        Конструктор доверенностей
      </h1>
      <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 24px" }}>
        Заполните форму — получите готовый документ по шаблону без правки стилей.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={lbl}>Шаблон</label>
            <Select value={template} className="ui-select--inp" onChange={(e) => setTemplate(e.target.value)}>
              {(templates.data ?? ["mgts_default"]).map((t) => (
                <option key={t} value={t}>{TEMPLATE_LABEL[t] ?? t}</option>
              ))}
            </Select>
          </div>
          <div>
            <label style={lbl}>Срок действия</label>
            <input style={inp} value={validity} onChange={(e) => setValidity(e.target.value)} placeholder="до 31.12.2026 / на 1 год" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>ФИО поверенного *</label>
            <input style={inp} value={fio} onChange={(e) => setFio(e.target.value)} placeholder="Иванов Иван Иванович" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Паспортные данные</label>
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={passport}
              onChange={(e) => setPassport(e.target.value)}
              placeholder="паспорт 4500 123456, выдан ОВД … 01.01.2010, код 770-001" />
          </div>
        </div>

        <div>
          <label style={lbl}>Полномочия ({picked.length}) — попадут в документ в порядке выбора</label>
          <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--radius-m)" }}>
            {authorities.isLoading ? (
              <Spinner size={16} />
            ) : active.length === 0 ? (
              <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                Нет активных полномочий — заведите в{" "}
                <LinkButton onClick={() => router.push("/services/poa/catalog")}>каталоге</LinkButton>
              </span>
            ) : active.map((a) => (
              <Checkbox key={a.id} checked={picked.includes(a.id)} onChange={() => toggle(a.id)}
                label={`${a.code} · ${a.name_short}`} />
            ))}
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

const lbl: React.CSSProperties = { display: "block", fontFamily: "MTS Compact, sans-serif", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "4px" };
const inp: React.CSSProperties = { width: "100%", padding: "7px 10px", fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-primary)", background: "var(--color-background-secondary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", outline: "none", boxSizing: "border-box" };
