"use client";

import { Button } from "@mts-ds/granat2-react-button";
import { StarIcon } from "@/components/icons/StarIcon";
import { useTags } from "@/lib/api/knowledge";
import type { ItemType } from "@/lib/api/knowledge";

export type KnowledgeFilters = {
  item_type?: ItemType;
  tag_ids: number[];
  favorites_only: boolean;
};

const TYPE_OPTIONS: Array<{ value: ItemType | undefined; label: string }> = [
  { value: undefined,    label: "Все типы" },
  { value: "article",   label: "Статьи" },
  { value: "document",  label: "Документы" },
  { value: "link",      label: "Ссылки" },
];

const STAR_GOLD = "#FFB800";

const labelStyle: React.CSSProperties = {
  fontFamily: "MTS Compact",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--color-text-tertiary)",
  marginRight: "8px",
  whiteSpace: "nowrap",
  alignSelf: "center",
};

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: KnowledgeFilters;
  onChange: (f: KnowledgeFilters) => void;
}) {
  const { data: tags = [] } = useTags(filters.item_type);

  const setType = (type: ItemType | undefined) => {
    // reset tag_ids when switching type — tags are type-specific
    onChange({ ...filters, item_type: type, tag_ids: [] });
  };

  const toggleTag = (tagId: number) => {
    const newIds = filters.tag_ids.includes(tagId)
      ? filters.tag_ids.filter((id) => id !== tagId)
      : [...filters.tag_ids, tagId];
    onChange({ ...filters, tag_ids: newIds });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Row 1: type filter (single select) + favorites */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
        <span style={labelStyle}>Тип:</span>
        {TYPE_OPTIONS.map((opt) => (
          <Button
            key={opt.value ?? "all"}
            variant={filters.item_type === opt.value ? "primary" : "secondary"}
            size={24}
            onClick={() => setType(opt.value)}
          >
            {opt.label}
          </Button>
        ))}

        <div style={{ width: "1px", height: "24px", background: "var(--color-background-secondary)", margin: "0 6px" }} />

        <Button
          variant={filters.favorites_only ? "primary" : "secondary"}
          size={24}
          onClick={() => onChange({ ...filters, favorites_only: !filters.favorites_only })}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: filters.favorites_only ? STAR_GOLD : undefined }}>
            <StarIcon size={13} />Избранное
          </span>
        </Button>
      </div>

      {/* Row 2: topic tags (multi-select), shown only when type is selected */}
      {filters.item_type && tags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
          <span style={labelStyle}>Тематика:</span>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant={filters.tag_ids.includes(tag.id) ? "primary" : "secondary"}
              size={24}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
