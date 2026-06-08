"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "@mts-ds/granat2-react-spinner";
import { useFavorites } from "@/lib/api/knowledge";
import { ItemCard } from "@/components/knowledge/ItemCard";

export default function FavoritesPage() {
  const router = useRouter();
  const { data, isLoading } = useFavorites();

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push("/knowledge")}
          style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--brand-blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          База знаний
        </button>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Избранное
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <span style={{ fontSize: "22px" }}>⭐</span>
        <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "24px", color: "var(--color-text-primary)", margin: 0 }}>
          Избранное
        </h1>
        {data && (
          <span style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-tertiary)" }}>
            {data.total} {plural(data.total)}
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Spinner size={24} />
        </div>
      ) : (data?.items.length ?? 0) === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "MTS Wide", fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary)", marginBottom: "8px" }}>
            Пока ничего нет
          </p>
          <p style={{ fontFamily: "MTS Compact", fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
            Добавляйте материалы в избранное — они появятся здесь
          </p>
          <button
            onClick={() => router.push("/knowledge")}
            style={{ padding: "10px 24px", background: "var(--brand-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-l)", fontFamily: "MTS Compact", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Перейти в базу знаний
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {data!.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
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
