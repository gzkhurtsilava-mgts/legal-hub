"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useSections, useSearch } from "@/lib/api/knowledge";
import { SearchBig } from "@/components/knowledge/SearchBig";
import { SectionCard } from "@/components/knowledge/SectionCard";
import { ItemCard } from "@/components/knowledge/ItemCard";

export default function KnowledgePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: searchResults, isLoading: searchLoading } = useSearch(q);

  const topSections = useMemo(
    () => (sections ?? []).filter((s) => s.parent_id === null),
    [sections]
  );

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{
        fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px",
        color: "var(--color-text-primary)", marginBottom: "8px",
      }}>
        База знаний
      </h1>
      <p style={{
        fontFamily: "MTS Compact", fontSize: "15px",
        color: "var(--color-text-secondary)", marginBottom: "32px",
      }}>
        Правовые инструкции, шаблоны и регламенты БПО
      </p>

      <div style={{ marginBottom: "40px" }}>
        <SearchBig initialValue={q} />
      </div>

      {q ? (
        <>
          <p style={{
            fontFamily: "MTS Compact", fontSize: "14px",
            color: "var(--color-text-secondary)", marginBottom: "20px",
          }}>
            {searchLoading
              ? "Поиск..."
              : `По запросу «${q}» найдено: ${searchResults?.total ?? 0}`}
          </p>

          {searchLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Spinner size={24} />
            </div>
          ) : searchResults?.items.length === 0 ? (
            <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
              Ничего не найдено. Попробуйте изменить запрос.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {searchResults?.items.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 style={{
            fontFamily: "MTS Wide", fontWeight: 700, fontSize: "20px",
            color: "var(--color-text-primary)", marginBottom: "20px",
          }}>
            Разделы
          </h2>

          {sectionsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Spinner size={24} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {topSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
