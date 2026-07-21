// Группировка полномочий по категориям (H1 · H2) — общая для матрицы и конструктора.

import type { Authority, AuthorityCategory } from "@/lib/api/poa";

export interface AuthorityGroup {
  /** id категории (или -1 для полномочий без категории) */
  id: number;
  title: string;
  items: Authority[];
}

/** Группирует полномочия по их категории; заголовок — «Родитель · Категория».
 *  Порядок групп — по sort_order родителя, затем категории; внутри — по коду. */
export function buildAuthorityGroups(
  categories: AuthorityCategory[],
  authorities: Authority[]
): AuthorityGroup[] {
  const byId = new Map(categories.map((c) => [c.id, c]));

  const title = (c: AuthorityCategory): string => {
    const parent = c.parent_id != null ? byId.get(c.parent_id) : undefined;
    return parent ? `${parent.name} · ${c.name}` : c.name;
  };
  const sortKey = (c: AuthorityCategory): [number, number] => {
    const parent = c.parent_id != null ? byId.get(c.parent_id) : undefined;
    return parent ? [parent.sort_order, c.sort_order] : [c.sort_order, -1];
  };

  const groups = new Map<number, AuthorityGroup>();
  for (const a of authorities) {
    const cat = byId.get(a.category_id);
    const key = cat?.id ?? -1;
    let g = groups.get(key);
    if (!g) {
      g = { id: key, title: cat ? title(cat) : "Без категории", items: [] };
      groups.set(key, g);
    }
    g.items.push(a);
  }

  for (const g of groups.values()) g.items.sort((a, b) => a.code.localeCompare(b.code));

  return [...groups.values()].sort((g1, g2) => {
    const c1 = byId.get(g1.id);
    const c2 = byId.get(g2.id);
    if (!c1 || !c2) return c1 ? -1 : 1;
    const [a1, b1] = sortKey(c1);
    const [a2, b2] = sortKey(c2);
    return a1 - a2 || b1 - b2;
  });
}
