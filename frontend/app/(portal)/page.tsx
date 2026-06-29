"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "88px 24px 64px" }}>
      <h1
        style={{
          fontFamily: "MTS Wide",
          fontWeight: 700,
          fontSize: "38px",
          color: "var(--color-text-primary)",
          textAlign: "center",
          margin: "0 0 32px",
        }}
      >
        Портал правового блока
      </h1>

      {/* Глобальный поиск */}
      <form onSubmit={submit} className="home2-search">
        <Icon name="AISearchSize24StyleOutline" size={26} style={{ color: "var(--brand-blue)", flexShrink: 0 }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найдите ответ или задайте вопрос ассистенту…"
          autoFocus
        />
        <button type="submit" className="home2-find" aria-label="Найти">
          <span className="home2-find__label">Найти</span>
          <Icon name="ArrowRightSize24StyleOutline" size={22} />
        </button>
      </form>

      {/* Сервисы — большие квадратные карточки */}
      <div className="home2-grid">
        {HOME_QUICK_APPS.map((app) => (
          <button key={app.id} className="home2-card" onClick={() => router.push(app.href)}>
            <span
              className="home2-card__icon"
              style={{ background: `color-mix(in srgb, ${app.color} 14%, var(--color-background-primary))` }}
            >
              <Icon name={app.icon} size={34} style={{ color: app.color }} />
            </span>
            <span className="home2-card__title">{app.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
