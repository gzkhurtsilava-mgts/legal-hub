"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Button } from "@mts-ds/granat2-react-button";
import { useSectionBySlug, useKnowledgeItems } from "@/lib/api/knowledge";
import { ItemCard } from "@/components/knowledge/ItemCard";
import { SectionCard } from "@/components/knowledge/SectionCard";
import { FilterPanel, type KnowledgeFilters } from "@/components/knowledge/FilterPanel";

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [filters, setFilters] = useState<KnowledgeFilters>({
    tag_ids: [],
    favorites_only: false,
  });

  const { data: section, isLoading: sectionLoading } = useSectionBySlug(slug);

  const hasChildren = (section?.children?.length ?? 0) > 0;

  const { data: itemsData, isLoading: itemsLoading } = useKnowledgeItems(
    section && !hasChildren
      ? {
          section_id: section.id,
          item_type: filters.item_type,
          tag_ids: filters.tag_ids.length ? filters.tag_ids : undefined,
          favorites_only: filters.favorites_only || undefined,
        }
      : undefined,
    { enabled: !!section && !hasChildren }
  );

  if (sectionLoading) {
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

  const parentSection = section.parent_id
    ? { slug: section.slug }  // we'll link back via browser history
    : null;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => router.push("/knowledge")}
          style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          База знаний
        </button>
        {section.parent_id && (
          <>
            <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
            <button
              onClick={() => router.back()}
              style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              {/* parent name not in response, back() is enough */}
              Назад
            </button>
          </>
        )}
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {section.name}
        </span>
      </div>

      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", marginBottom: "8px" }}>
        {section.name}
      </h1>

      {section.description && (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "28px", lineHeight: 1.6 }}>
          {section.description}
        </p>
      )}

      {/* Parent section: show subsection cards */}
      {hasChildren ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {section.children.map((child) => (
            <SectionCard key={child.id} section={child} />
          ))}
        </div>
      ) : (
        /* Leaf section: show items with filters */
        <>
          <div style={{ marginBottom: "24px" }}>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>

          {itemsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Spinner size={24} />
            </div>
          ) : itemsData?.items.length === 0 ? (
            <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
              {filters.favorites_only
                ? "Нет избранных материалов в этом разделе"
                : "В этом разделе пока нет опубликованных материалов"}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {itemsData?.items.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
