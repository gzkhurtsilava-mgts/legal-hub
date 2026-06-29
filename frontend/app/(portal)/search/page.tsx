"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";
import { useSearch, type KnowledgeItem } from "@/lib/api/knowledge";
import { useProcesses } from "@/lib/api/processes";
import { ItemCard } from "@/components/knowledge/ItemCard";
import { searchApps } from "@/lib/apps";

const sectionH2: React.CSSProperties = {
  fontFamily: "MTS Wide",
  fontWeight: 700,
  fontSize: "16px",
  color: "var(--color-text-primary)",
  margin: "0 0 14px",
};

function AiAnswer({ query }: { query: string }) {
  return (
    <div className="ai-answer">
      <div className="ai-answer__head">
        <Icon name="AISearchSize24StyleOutline" size={20} style={{ color: "var(--brand-blue)" }} />
        <span className="ai-answer__title">Ответ ассистента</span>
        <span className="ai-answer__badge">В разработке</span>
      </div>
      <p className="ai-answer__body">
        Здесь появится ответ ИИ-ассистента на запрос «{query}». Ассистент сможет ответить
        на любой вопрос — по базе знаний, процессам и общим правовым темам — и приложит ссылки
        на источники.
      </p>
      <p className="ai-answer__note">
        Функция в разработке: ИИ-агент будет подключён позже. Пока ниже — результаты по базе знаний.
      </p>
    </div>
  );
}

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q0 = params.get("q") ?? "";
  const [q, setQ] = useState(q0);
  useEffect(() => setQ(q0), [q0]);

  const { data, isLoading } = useSearch(q0);
  const results = data?.items ?? [];

  const appMatches = searchApps(q0);
  const { data: allProc } = useProcesses({ q: q0 || undefined });
  const procMatches = q0.length >= 2 ? (allProc ?? []) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", padding: "32px 24px 64px" }}>
      <form onSubmit={submit} className="home-search" style={{ marginBottom: "28px" }}>
        <Icon name="AISearchSize24StyleOutline" size={24} style={{ color: "var(--brand-blue)", flexShrink: 0 }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найдите ответ или задайте вопрос ассистенту…"
          autoFocus
        />
        <Button type="submit" style={{ borderRadius: "var(--radius-xl)", flexShrink: 0 }}>Найти</Button>
      </form>

      {q0.length < 2 ? (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", textAlign: "center", padding: "40px 0" }}>
          Введите запрос, чтобы найти материалы и получить ответ ассистента
        </p>
      ) : (
        <>
          <AiAnswer query={q0} />

          {appMatches.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <h2 style={sectionH2}>Приложения</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {appMatches.map((app) => (
                  <button key={app.id} className="home-app" onClick={() => router.push(app.href)}>
                    <Icon name={app.icon} size={18} style={{ color: app.color }} />
                    {app.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          {procMatches.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <h2 style={sectionH2}>Процессы · {procMatches.length}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {procMatches.map((p: { id: string; name: string; version: string | number }) => (
                  <button
                    key={p.id}
                    className="ui-cardlink"
                    onClick={() => router.push(`/processes/${p.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--color-background-primary)", border: "1px solid var(--color-line)", borderRadius: "var(--radius-m)", textAlign: "left", cursor: "pointer", width: "100%" }}
                  >
                    <Icon name="MapSize24StyleOutline" size={20} style={{ color: "var(--brand-blue)", flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "MTS Compact", fontWeight: 500, fontSize: "14px", color: "var(--color-text-primary)" }}>{p.name}</span>
                      <span style={{ display: "block", fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>{p.id} · v{p.version}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <h2 style={sectionH2}>
            Результаты в базе знаний{!isLoading && results.length > 0 ? ` · ${results.length}` : ""}
          </h2>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Spinner size={44} />
            </div>
          ) : results.length === 0 ? (
            <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)" }}>
              По запросу «{q0}» в базе знаний ничего не найдено
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {results.map((item: KnowledgeItem) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
