"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/GranatCard";
import { Icon } from "@/components/icons";
import type { KnowledgeItem } from "@/lib/api/knowledge";
import { FavoritesToggle } from "./FavoritesToggle";

const TYPE_LABELS: Record<string, string> = {
  article: "Статья",
  document: "Документ",
  link: "Ссылка",
};

const TYPE_COLORS: Record<string, string> = {
  article: "var(--brand-blue)",
  document: "var(--color-accent-positive)",
  link: "var(--color-accent-warning)",
};

const TYPE_ICON_NAMES: Record<string, string> = {
  article: "OpenBookSize16StyleOutline",
  document: "DocumentSize16StyleOutline",
  link: "LinkSize16StyleOutline",
};

export function ItemCard({ item }: { item: KnowledgeItem }) {
  const router = useRouter();
  const color = TYPE_COLORS[item.item_type] ?? "var(--brand-blue)";
  const iconName = TYPE_ICON_NAMES[item.item_type];

  return (
    <Card
      variant="default"
      device="desktop"
      size="m"
      cornerRadius={32}
      className="ui-cardlink"
      style={{ padding: "20px" }}
      onClick={() => router.push(`/knowledge/items/${item.id}`)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          fontFamily: "MTS Compact", fontSize: "12px", fontWeight: 500,
          color, background: `${color}18`,
          padding: "3px 8px", borderRadius: "999px",
        }}>
          {iconName && <Icon name={iconName} size={14} />}
          {TYPE_LABELS[item.item_type] ?? item.item_type}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <FavoritesToggle itemId={item.id} isFavorite={item.is_favorite} />
        </div>
      </div>

      <p style={{
        fontFamily: "MTS Compact", fontWeight: 700, fontSize: "15px",
        color: "var(--color-text-primary)", marginBottom: "8px", lineHeight: 1.3,
      }}>
        {item.title}
      </p>

      {item.summary && (
        <p style={{
          fontFamily: "MTS Compact", fontSize: "13px",
          color: "var(--color-text-secondary)", lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {item.summary}
        </p>
      )}

      {item.tags.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
          {item.tags.map((tag) => (
            <span key={tag.id} style={{
              fontFamily: "MTS Compact", fontSize: "12px",
              color: tag.color ?? "var(--brand-blue)",
              background: `${tag.color ?? "var(--brand-blue)"}18`,
              padding: "2px 8px", borderRadius: "999px",
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
