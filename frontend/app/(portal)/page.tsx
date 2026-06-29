"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";
import { HOME_QUICK_APPS } from "@/lib/apps";

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "72px 24px 56px" }}>
      <h1
        style={{
          fontFamily: "MTS Wide",
          fontWeight: 700,
          fontSize: "28px",
          color: "var(--color-text-primary)",
          textAlign: "center",
          margin: "0 0 24px",
        }}
      >
        Портал правового блока
      </h1>

      {/* Глобальный поиск */}
      <form onSubmit={submit} className="home-search">
        <Icon name="AISearchSize24StyleOutline" size={24} style={{ color: "var(--brand-blue)", flexShrink: 0 }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найдите ответ или задайте вопрос ассистенту…"
          autoFocus
        />
        <Button type="submit" style={{ borderRadius: "var(--radius-xl)", flexShrink: 0 }}>Найти</Button>
      </form>

      {/* Быстрый доступ */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
        {HOME_QUICK_APPS.map((app) => (
          <button key={app.id} className="home-app" onClick={() => router.push(app.href)}>
            <Icon name={app.icon} size={18} style={{ color: app.color }} />
            {app.title}
          </button>
        ))}
      </div>
    </div>
  );
}
