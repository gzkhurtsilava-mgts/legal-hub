"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { IconButton } from "@/components/ui";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const AI_PLACEHOLDER =
  "ИИ-агент пока в разработке. Скоро здесь будет развёрнутый ответ со ссылками на базу знаний и процессы — это демонстрация интерфейса диалога.";

function AssistantInner() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [messages, setMessages] = useState<Msg[]>(() =>
    initialQ.trim()
      ? [{ role: "user", text: initialQ.trim() }, { role: "ai", text: AI_PLACEHOLDER }]
      : [{ role: "ai", text: "Здравствуйте! Я ассистент правового блока. Задайте вопрос — помогу с документами, процессами и правовыми темами." }]
  );
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }, { role: "ai", text: AI_PLACEHOLDER }]);
    setDraft("");
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <Icon name="AISearchSize24StyleOutline" size={24} style={{ color: "var(--brand-blue)" }} />
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "22px", color: "var(--color-text-primary)", margin: 0 }}>
          Ассистент БПО
        </h1>
        <span className="ai-answer__badge">Скоро</span>
      </div>
      <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 24px" }}>
        Диалог с правовым ассистентом. Сейчас это демонстрация интерфейса — ответы появятся после подключения ИИ-агента.
      </p>

      <div>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === "user" ? "chat-msg--user" : ""}`}>
            <div className={`chat-bubble ${m.role === "user" ? "chat-bubble--user" : "chat-bubble--ai"}`}>
              {m.role === "ai" && (
                <span className="chat-ai-head">
                  <Icon name="AISearchSize24StyleOutline" size={14} style={{ color: "var(--brand-blue)" }} />
                  Ассистент
                </span>
              )}
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="chat-composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Напишите сообщение…"
          autoFocus
        />
        <IconButton size={44} label="Отправить" disabled={!draft.trim()} onClick={() => {}} type="submit">
          <Icon name="SendSize24StyleOutline" size={20} style={{ color: "var(--brand-blue)" }} />
        </IconButton>
      </form>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={null}>
      <AssistantInner />
    </Suspense>
  );
}
