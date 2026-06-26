"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { Card } from "@/components/GranatCard";
import { useSections, useSearch, useFavorites } from "@/lib/api/knowledge";
import { Icon } from "@/components/icons";
import { SearchBig } from "@/components/knowledge/SearchBig";
import { SectionCard } from "@/components/knowledge/SectionCard";
import { ItemCard } from "@/components/knowledge/ItemCard";
import { Button } from "@/components/ui";

export default function KnowledgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const q = searchParams.get("q") ?? "";

  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: favoritesData } = useFavorites();
  const { data: searchResults, isLoading: searchLoading } = useSearch(q);

  const topSections = useMemo(
    () => (sections ?? []).filter((s) => s.parent_id === null),
    [sections]
  );

  const favCount = favoritesData?.total ?? 0;

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "8px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "28px", color: "var(--color-text-primary)", margin: 0 }}>
            База знаний
          </h1>
        </div>
        {isAdmin && (
          <Button
            variant="secondary"
            onClick={() => router.push("/knowledge/admin/sections")}
            icon={<Icon name="SettingsSize24StyleOutline" size={15} />}
            style={{ flexShrink: 0 }}
          >
            Разделы
          </Button>
        )}
      </div>
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
              {/* Карточка «Избранное» — всегда первая */}
              <Card
                variant="default"
                device="desktop"
                size="m"
                cornerRadius={32}
                className="ui-cardlink"
                onClick={() => router.push("/knowledge/favorites")}
                style={{ padding: "24px" }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-m)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Icon name="StarSize24StyleFill" size={24} style={{ color: "#FFB800" }} />
                </div>
                <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", marginBottom: "8px", lineHeight: 1.3 }}>
                  Избранное
                </p>
                <p style={{ fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  Сохранённые материалы
                </p>
                {favCount > 0 && (
                  <p style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    {favCount} {plural(favCount)}
                  </p>
                )}
              </Card>

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

function plural(n: number) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "материал";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "материала";
  return "материалов";
}
