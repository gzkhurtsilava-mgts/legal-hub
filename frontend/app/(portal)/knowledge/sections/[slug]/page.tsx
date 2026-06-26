"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Button, LinkButton } from "@/components/ui";
import {
  useSectionBySlug, useKnowledgeItems, useTypeahead, useSearch,
} from "@/lib/api/knowledge";
import { SearchIcon, CrossIcon, Icon } from "@/components/icons";
import { ItemCard } from "@/components/knowledge/ItemCard";
import { SectionCard } from "@/components/knowledge/SectionCard";
import { FilterPanel, type KnowledgeFilters } from "@/components/knowledge/FilterPanel";

const EDITOR_ROLES = ["admin", "lawyer"];

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const isEditor = EDITOR_ROLES.includes((session?.user as { role?: string })?.role ?? "");

  const [filters, setFilters] = useState<KnowledgeFilters>({ tag_ids: [], favorites_only: false });
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [showTypeahead, setShowTypeahead] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: section, isLoading: sectionLoading } = useSectionBySlug(slug);
  const hasChildren = (section?.children?.length ?? 0) > 0;

  const { data: itemsData, isLoading: itemsLoading } = useKnowledgeItems(
    section && !hasChildren && !activeSearch
      ? {
          section_id: section.id,
          item_type: filters.item_type,
          tag_ids: filters.tag_ids.length ? filters.tag_ids : undefined,
          favorites_only: filters.favorites_only || undefined,
        }
      : undefined,
    { enabled: !!section && !hasChildren && !activeSearch }
  );

  const { data: searchData, isLoading: searchLoading } = useSearch(
    activeSearch,
    { section_id: section?.id }
  );

  const { data: typeaheadData } = useTypeahead(searchInput);

  // Close typeahead on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowTypeahead(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchSubmit = (q: string) => {
    const trimmed = q.trim();
    setActiveSearch(trimmed);
    setSearchInput(trimmed);
    setShowTypeahead(false);
  };

  const clearSearch = () => {
    setActiveSearch("");
    setSearchInput("");
  };

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
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="ArrowLeftSize24StyleOutline" size={16} />База знаний</span>
        </Button>
      </div>
    );
  }

  // Items to display: normal or search results
  const displayItems = activeSearch ? searchData?.items : itemsData?.items;
  const displayLoading = activeSearch ? searchLoading : itemsLoading;

  // Filter typeahead to current section items
  const typeaheadItems = (typeaheadData?.items ?? []).filter((i) => i.section_id === section.id);

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <LinkButton onClick={() => router.push("/knowledge")}>База знаний</LinkButton>
        {section.parent_id && (
          <>
            <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
            <LinkButton onClick={() => router.back()}>Назад</LinkButton>
          </>
        )}
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {section.name}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0, flex: 1 }}>
          {section.name}
        </h1>
        {isEditor && !hasChildren && (
          <Button
            onClick={() => router.push("/knowledge/admin/items/new")}
            icon={<Icon name="PlusSize24StyleOutline" size={16} />}
          >
            Добавить
          </Button>
        )}
      </div>

      {section.description && (
        <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "20px", lineHeight: 1.6 }}>
          {section.description}
        </p>
      )}

      {/* Parent section: show subsection cards (no search) */}
      {hasChildren ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {section.children.map((child) => (
            <SectionCard key={child.id} section={child} />
          ))}
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div ref={searchRef} style={{ position: "relative", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "var(--color-background-primary)", borderRadius: "var(--radius-l)", border: "1.5px solid var(--color-background-lower)", boxShadow: activeSearch ? "0 0 0 2px var(--brand-blue)44" : "none" }}>
              <SearchIcon size={18} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
              <input
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowTypeahead(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(searchInput); if (e.key === "Escape") { setShowTypeahead(false); } }}
                onFocus={() => { if (searchInput.length >= 2) setShowTypeahead(true); }}
                placeholder={`Поиск в разделе «${section.name}»…`}
                style={{ flex: 1, border: "none", outline: "none", fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)", background: "transparent" }}
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", padding: 0, flexShrink: 0, display: "flex", alignItems: "center" }}
                >
                  <CrossIcon size={18} />
                </button>
              )}
              {searchInput && !activeSearch && (
                <button
                  onClick={() => handleSearchSubmit(searchInput)}
                  style={{ padding: "4px 14px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "13px", cursor: "pointer", flexShrink: 0 }}
                >
                  Найти
                </button>
              )}
            </div>

            {/* Typeahead dropdown */}
            {showTypeahead && searchInput.length >= 2 && typeaheadItems.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 40, background: "var(--color-background-primary)", border: "1px solid var(--color-background-lower)", borderRadius: "var(--radius-m)", boxShadow: "var(--shadow-middle)", overflow: "hidden" }}>
                {typeaheadItems.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/knowledge/items/${item.id}`)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    {item.title}
                  </button>
                ))}
                <button
                  onClick={() => handleSearchSubmit(searchInput)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: "none", border: "none", borderTop: "1px solid var(--color-background-lower)", cursor: "pointer", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--brand-blue)" }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Показать все результаты для «{searchInput}»<Icon name="ArrowRightSize24StyleOutline" size={14} /></span>
                </button>
              </div>
            )}
          </div>

          {/* Active search label */}
          {activeSearch && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Результаты по запросу: <b>«{activeSearch}»</b>
              </span>
              <button onClick={clearSearch} style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                × Сбросить
              </button>
            </div>
          )}

          {/* FilterPanel — скрываем при активном поиске */}
          {!activeSearch && (
            <div style={{ marginBottom: "24px" }}>
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          )}

          {displayLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <Spinner size={24} />
            </div>
          ) : (displayItems ?? []).length === 0 ? (
            <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-tertiary)", padding: "20px 0" }}>
              {activeSearch
                ? `По запросу «${activeSearch}» в этом разделе ничего не найдено`
                : filters.favorites_only
                ? "Нет избранных материалов в этом разделе"
                : "В этом разделе пока нет опубликованных материалов"}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {(displayItems ?? []).map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
