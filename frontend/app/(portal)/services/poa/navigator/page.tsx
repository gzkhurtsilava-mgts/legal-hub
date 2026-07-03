"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { ProgressLinear } from "@mts-ds/granat2-react-progress-linear";
import { Icon } from "@/components/icons";
import { LinkButton } from "@/components/ui";
import { useNavigatorStep, type NavigatorStep } from "@/lib/api/poa";

export default function PoaNavigatorPage() {
  const router = useRouter();
  const navStep = useNavigatorStep();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [step, setStep] = useState<NavigatorStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStep = async (a: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      setStep(await navStep(a));
    } catch (e) {
      setError((e as Error)?.message ?? "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  // старт
  useEffect(() => {
    fetchStep({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (qid: string, value: string) => {
    const na = { ...answers, [qid]: value };
    setAnswers(na);
    setOrder([...order, qid]);
    fetchStep(na);
  };

  const back = () => {
    if (order.length === 0) return;
    const last = order[order.length - 1];
    const na = { ...answers };
    delete na[last];
    setAnswers(na);
    setOrder(order.slice(0, -1));
    fetchStep(na);
  };

  const restart = () => {
    setAnswers({});
    setOrder([]);
    fetchStep({});
  };

  const pct = step
    ? step.status === "result"
      ? 100
      : Math.round((step.answered / Math.max(step.total, 1)) * 100)
    : 0;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <LinkButton onClick={() => router.push("/services/poa")}>Доверенности</LinkButton>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "14px", color: "var(--color-text-secondary)" }}>Навигатор</span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: "0 0 4px" }}>
        Навигатор доверенностей
      </h1>
      <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 24px" }}>
        Ответьте на несколько вопросов — подскажем, куда подать заявку.
      </p>

      <div style={{ marginBottom: "24px" }}>
        <ProgressLinear value={pct} size="s" />
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-l)",
          padding: "28px",
          minHeight: "220px",
        }}
      >
        {loading && !step ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner size={24} /></div>
        ) : error ? (
          <p style={{ fontFamily: "MTS Compact, sans-serif", color: "var(--color-accent-negative)" }}>{error}</p>
        ) : step?.status === "question" && step.question ? (
          <div>
            <p style={{ fontFamily: "MTS Wide, sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary)", margin: "0 0 20px" }}>
              {step.question.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {step.question.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className="ui-hover-border"
                  onClick={() => pick(step.question!.id, opt)}
                  disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", textAlign: "left",
                    padding: "14px 16px", cursor: "pointer",
                    background: "var(--color-background-primary)",
                    border: "1px solid var(--color-line)", borderRadius: "var(--radius-m)",
                    fontFamily: "MTS Compact, sans-serif", fontSize: "15px",
                    color: "var(--color-text-primary)", width: "100%",
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: "24px", height: "24px", borderRadius: "var(--radius-xl)",
                    background: "var(--color-accent-brand-bg)", color: "var(--color-brand)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 500,
                  }}>{i + 1}</span>
                  {opt}
                </button>
              ))}
            </div>
            {order.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <LinkButton onClick={back} icon={<Icon name="ArrowLeftSize24StyleOutline" size={16} />}>Назад</LinkButton>
              </div>
            )}
          </div>
        ) : step?.status === "result" ? (
          <div>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "48px", height: "48px", borderRadius: "var(--radius-m)",
              background: step.url ? "var(--color-accent-positive-bg)" : "var(--color-accent-warning-bg)",
              color: step.url ? "var(--color-accent-positive)" : "var(--color-text-primary)",
              marginBottom: "16px",
            }}>
              <Icon name={step.url ? "CheckCircleSize24StyleOutline" : "InfoCircleSize24StyleOutline"} size={24} />
            </span>
            <p style={{ fontFamily: "MTS Compact, sans-serif", fontSize: "16px", color: "var(--color-text-primary)", margin: "0 0 20px", lineHeight: 1.5 }}>
              {step.result}
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {step.url && (
                <a href={step.url} target="_blank" rel="noreferrer" className="ui-btn ui-btn--primary ui-btn--m">
                  Перейти к заявке
                  <Icon name="ArrowRightSize24StyleOutline" size={16} />
                </a>
              )}
              <LinkButton onClick={restart}>Пройти заново</LinkButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
