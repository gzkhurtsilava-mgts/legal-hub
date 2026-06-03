"use client";

import { Button } from "@mts-ds/granat2-react-button";
import type { ItemType, Tag } from "@/lib/api/knowledge";

export type KnowledgeFilters = {
  item_type?: ItemType;
  tag_ids: number[];
  favorites_only: boolean;
};

const TYPE_OPTIONS: Array<{ value: ItemType | undefined; label: string }> = [
  { value: undefined, label: "Все" },
  { value: "article", label: "Статьи" },
  { value: "document", label: "Документы" },
  { value: "link", label: "Ссылки" },
  { value: "faq", label: "FAQ" },
];

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: "4px", verticalAlign: "middle" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export function FilterPanel({
  tags,
  filters,
  onChange,
}: {
  tags: Tag[];
  filters: KnowledgeFilters;
  onChange: (f: KnowledgeFilters) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      {TYPE_OPTIONS.map((opt) => (
        <Button
          key={opt.value ?? "all"}
          variant={filters.item_type === opt.value ? "primary" : "secondary"}
          size={24}
          onClick={() => onChange({ ...filters, item_type: opt.value })}
        >
          {opt.label}
        </Button>
      ))}

      <div style={{ width: "1px", height: "24px", background: "var(--color-background-secondary)", margin: "0 4px" }} />

      <Button
        variant={filters.favorites_only ? "primary" : "secondary"}
        size={24}
        onClick={() => onChange({ ...filters, favorites_only: !filters.favorites_only })}
      >
        <StarIcon />Избранное
      </Button>

      {tags.length > 0 && (
        <>
          <div style={{ width: "1px", height: "24px", background: "var(--color-background-secondary)", margin: "0 4px" }} />
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant={filters.tag_ids.includes(tag.id) ? "primary" : "secondary"}
              size={24}
              onClick={() => {
                const newIds = filters.tag_ids.includes(tag.id)
                  ? filters.tag_ids.filter((id) => id !== tag.id)
                  : [...filters.tag_ids, tag.id];
                onChange({ ...filters, tag_ids: newIds });
              }}
            >
              {tag.name}
            </Button>
          ))}
        </>
      )}
    </div>
  );
}
