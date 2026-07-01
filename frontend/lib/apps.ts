// Единый реестр приложений портала.
// Используется и лаунчером в шапке, и блоком быстрого доступа на главной.

export type AppTab = "business" | "law";

export interface AppEntry {
  id: string;
  title: string;
  href: string;
  /** Имя иконки из набора <Icon name=... /> */
  icon: string;
  /** Путь к 3D-иллюстрации на прозрачном фоне (public/cards/*.png).
   *  Если задан — на карточке главной показывается картинка вместо иконки. */
  image?: string;
  /** Короткое описание под заголовком карточки на главной (2–3 слова). */
  caption?: string;
  /** Акцентный цвет плитки (CSS-переменная) */
  color: string;
  /** В каких вкладках лаунчера показывать (Бизнес / Право) */
  tabs: AppTab[];
}

export const APPS: AppEntry[] = [
  {
    id: "knowledge",
    title: "База знаний",
    href: "/knowledge",
    icon: "OpenBookSize24StyleOutline",
    image: "/cards/knowledge.png",
    caption: "Регламенты и практика",
    color: "var(--color-accent-warning)",
    tabs: ["business", "law"],
  },
  {
    id: "processes",
    title: "Карта процессов",
    href: "/processes",
    icon: "MapSize24StyleOutline",
    color: "var(--brand-blue)",
    tabs: ["law"],
  },
  {
    id: "poa",
    title: "Доверенности",
    href: "/services/poa",
    icon: "FolderSize24StyleOutline",
    image: "/cards/poa.png",
    caption: "Оформление и проверка",
    color: "var(--brand-blue)",
    tabs: ["business", "law"],
  },
  {
    id: "disputes",
    title: "Статус спора",
    href: "/services/disputes",
    icon: "GavelSize24StyleOutline",
    image: "/cards/disputes.png",
    caption: "Статус судебного дела",
    color: "var(--color-accent-positive)",
    tabs: ["business"],
  },
  {
    id: "documents",
    title: "Конструктор документов",
    href: "/services/documents",
    icon: "EditSize24StyleOutline",
    image: "/cards/documents.png",
    caption: "Сборка по шаблону",
    color: "var(--color-accent-negative)",
    tabs: ["business"],
  },
  {
    id: "news",
    title: "Правовые новости",
    href: "/news",
    icon: "NewsSize24StyleOutline",
    image: "/cards/news.png",
    caption: "Изменения в праве",
    color: "var(--color-accent-negative)",
    tabs: ["business"],
  },
  {
    id: "stats",
    title: "Статистика",
    href: "/dashboards",
    icon: "StatisticsSize24StyleOutline",
    color: "var(--color-accent-positive)",
    tabs: ["law"],
  },
  {
    id: "requests",
    title: "Запросы",
    href: "/requests",
    icon: "MailSize24StyleOutline",
    color: "var(--brand-blue)",
    tabs: ["law"],
  },
];

const byId = (id: string) => APPS.find((a) => a.id === id)!;

/** Приложения для вкладки лаунчера. */
export function appsForTab(tab: AppTab): AppEntry[] {
  return APPS.filter((a) => a.tabs.includes(tab));
}

/** Роли, которым доступны вкладки Бизнес/Право. */
export function hasTabs(role?: string): boolean {
  return role === "admin" || role === "lawyer";
}

/** Сервисные карточки на главной (без «Карты процессов» — она в лаунчере). */
export const HOME_QUICK_APPS: AppEntry[] = [
  byId("knowledge"),
  byId("poa"),
  byId("disputes"),
  byId("news"),
  byId("documents"),
];

/** Поиск приложений по названию (для глобального поиска).
 *  Терпим к русским окончаниям: матчим по основе слова (без хвоста). */
export function searchApps(query: string): AppEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const stem = q.slice(0, Math.max(4, q.length - 2));
  return APPS.filter((a) => {
    const title = a.title.toLowerCase();
    if (title.includes(q)) return true;
    return title.split(/\s+/).some((w) => w.startsWith(stem));
  });
}
