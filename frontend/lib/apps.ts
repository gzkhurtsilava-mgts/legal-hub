// Единый реестр приложений портала.
// Используется и лаунчером в шапке, и блоком быстрого доступа на главной.

export type AppTab = "business" | "law";

export interface AppEntry {
  id: string;
  title: string;
  href: string;
  /** Имя иконки из набора <Icon name=... /> */
  icon: string;
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
    title: "Навигатор доверенностей",
    href: "/services/poa",
    icon: "FolderSize24StyleOutline",
    color: "var(--brand-blue)",
    tabs: ["business", "law"],
  },
  {
    id: "disputes",
    title: "Статус спора",
    href: "/services/disputes",
    icon: "GavelSize24StyleOutline",
    color: "var(--color-accent-positive)",
    tabs: ["business"],
  },
  {
    id: "documents",
    title: "Конструктор документов",
    href: "/services/documents",
    icon: "EditSize24StyleOutline",
    color: "var(--color-accent-negative)",
    tabs: ["business"],
  },
  {
    id: "news",
    title: "Правовые новости",
    href: "/news",
    icon: "NewsSize24StyleOutline",
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

/** Быстрый доступ на главной — фиксированный порядок. */
export const HOME_QUICK_APPS: AppEntry[] = [
  byId("processes"),
  byId("knowledge"),
  byId("poa"),
  byId("disputes"),
  byId("news"),
  byId("documents"),
];
