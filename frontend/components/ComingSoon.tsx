"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";

interface Props {
  title: string;
  description?: string;
  icon?: string;
}

export function ComingSoon({ title, description, icon }: Props) {
  const router = useRouter();
  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-l)",
          background: "var(--color-brand-subtle)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <Icon name={icon ?? "SettingsSize24StyleOutline"} size={32} style={{ color: "var(--brand-blue)" }} />
      </div>
      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "26px", color: "var(--color-text-primary)", margin: "0 0 12px" }}>
        {title}
      </h1>
      <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 28px" }}>
        {description ?? "Раздел в разработке. Скоро здесь появится полноценный сервис."}
      </p>
      <Button variant="secondary" onClick={() => router.push("/")}>На главную</Button>
    </div>
  );
}
