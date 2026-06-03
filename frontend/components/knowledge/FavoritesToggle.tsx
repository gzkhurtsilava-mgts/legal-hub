"use client";

import { ButtonIcon } from "@mts-ds/granat2-react-button";
import { useToggleFavorite } from "@/lib/api/knowledge";

const StarFilled = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarOutline = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export function FavoritesToggle({
  itemId,
  isFavorite,
}: {
  itemId: number;
  isFavorite: boolean;
}) {
  const { add, remove } = useToggleFavorite(itemId);
  const isPending = add.isPending || remove.isPending;

  return (
    <ButtonIcon
      size={32}
      variant="ghost"
      contextBackgroundColor="primary"
      aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
      onClick={(e) => {
        e.stopPropagation();
        isFavorite ? remove.mutate() : add.mutate();
      }}
      disabled={isPending}
      style={{ color: isFavorite ? "var(--brand-blue)" : "var(--color-icons-secondary)" }}
    >
      {isFavorite ? <StarFilled /> : <StarOutline />}
    </ButtonIcon>
  );
}
