"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Button } from "@mts-ds/granat2-react-button";
import { useSections, useKnowledgeItems, useTags } from "@/lib/api/knowledge";
import type { ItemType } from "@/lib/api/knowledge";
import { ItemCard } from "@/components/knowledge/ItemCard";
import { FilterPanel, type KnowledgeFilters } from "@/components/knowledge/FilterPanel";

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [filters, setFilters] = useState<KnowledgeFilters>({
    tag_ids: [],
    favorites_only: false,
  });

  const { data: allSections } = useSections();
  const section = useMemo(
    () => allSections?.find((s) => s.slug === slug),
    [allSections, slug]
  );

  const { data: tags } = useTags();

  const { data: itemsData, isLoading } = useKnowledgeItems(
    section
      ? {
          section_id: section.id,
          item_type: filters.item_type,
          tag_ids: filters.tag_ids.length ? filters.tag_ids : undefined,
          favorites_only: filters.favorites_only || undefined,
        }
      : undefined,
    { enabled: !!section }
  );

  if (!allSections) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!section) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <p style={{ fontFamily: "MTS Compact", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          Раздел не найден
        </p>
        <Button variant="secondary" onClick={() => router.push("/knowledge")}>
          ← База знаний
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push("/knowledge")}
          style={{
            fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          База знаний
        </button>
        <span style={{ color: "var(--color-text-tertiary)", fontSize: "16px" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {section.name}
        </span>
      </div>

      <h1 style={{
        fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px",
        color: "var(--color-text-primary)", marginBottom: "8px",
      }}>
        {section.name}
      </h1>

      {section.description && (
        <p style={{
          fontFamily: "MTS Compact", fontSize: "15px",
          color: "var(--color-text-secondary)", marginBottom: "28px", lineHeight: 1.6,
        }}>
          {section.description}
        </p>
      )}

      <div style={{ marginBottom: "24px" }}>
        <FilterPanel
          tags={tags ?? []}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={24} />
        </div>
      ) : itemsData?.items.length === 0 ? (
        <p style={{
          fontFamily: "MTS Compact", fontSize: "15px",
          color: "var(--color-text-tertiary)", padding: "20px 0",
        }}>
          {filters.favorites_only
            ? "Нет избранных материалов в этом разделе"
            : "В этом разделе пока нет опубликованных материалов"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {itemsData?.items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
