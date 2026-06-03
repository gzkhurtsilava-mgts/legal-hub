"use client";

import { useState, useEffect } from "react";
import { ButtonIcon } from "@mts-ds/granat2-react-button";
import { StarIcon } from "@/components/icons/StarIcon";
import { useToggleFavorite } from "@/lib/api/knowledge";

const GOLD = "#FFB800";
const INACTIVE = "var(--color-icons-secondary)";

export function FavoritesToggle({
  itemId,
  isFavorite,
}: {
  itemId: number;
  isFavorite: boolean;
}) {
  const [optimistic, setOptimistic] = useState(isFavorite);
  const { add, remove } = useToggleFavorite(itemId);

  useEffect(() => { setOptimistic(isFavorite); }, [isFavorite]);

  const handleToggle = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const next = !optimistic;
    setOptimistic(next);
    if (next) {
      add.mutate(undefined, { onError: () => setOptimistic(!next) });
    } else {
      remove.mutate(undefined, { onError: () => setOptimistic(!next) });
    }
  };

  return (
    <ButtonIcon
      size={32}
      variant="ghost"
      contextBackgroundColor="primary"
      aria-label={optimistic ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={handleToggle}
      style={{ color: optimistic ? GOLD : INACTIVE }}
    >
      <StarIcon size={20} />
    </ButtonIcon>
  );
}
