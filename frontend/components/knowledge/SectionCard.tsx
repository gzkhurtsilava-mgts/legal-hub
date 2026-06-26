"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/GranatCard";
import { Icon } from "@/components/icons";
import type { Section } from "@/lib/api/knowledge";

const ICON_NAME_MAP: Record<string, string> = {
  "file-text": "DocumentSize24StyleOutline",
  scale: "GavelSize24StyleOutline",
  "book-open": "OpenBookSize24StyleOutline",
  lock: "LockSize24StyleOutline",
};

function pluralize(n: number): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} материал`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} материала`;
  return `${n} материалов`;
}

export function SectionCard({ section }: { section: Section }) {
  const router = useRouter();

  return (
    <Card
      variant="default"
      device="desktop"
      size="m"
      cornerRadius={32}
      className="ui-cardlink"
      onClick={() => router.push(`/knowledge/sections/${section.slug}`)}
      style={{ padding: "24px" }}
    >
      <div style={{
        width: "48px", height: "48px",
        borderRadius: "var(--radius-m)",
        background: "var(--color-background-secondary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
      }}>
        <Icon
          name={ICON_NAME_MAP[section.icon ?? ""] ?? "FolderSize24StyleOutline"}
          size={24}
          style={{ color: "var(--brand-blue)" }}
        />
      </div>

      <p style={{
        fontFamily: "MTS Wide", fontWeight: 700, fontSize: "15px",
        color: "var(--color-text-primary)", marginBottom: "8px", lineHeight: 1.3,
      }}>
        {section.name}
      </p>

      {section.description && (
        <p style={{
          fontFamily: "MTS Compact", fontSize: "13px",
          color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "12px",
        }}>
          {section.description}
        </p>
      )}

      {section.item_count > 0 && (
        <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
          {pluralize(section.item_count)}
        </p>
      )}
    </Card>
  );
}
