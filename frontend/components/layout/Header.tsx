"use client";

import Link from "next/link";
import { NavLink } from "./NavLink";
import { SearchBar } from "./SearchBar";
import { AppLauncher } from "./AppLauncher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV_ITEMS = [
  { href: "/", label: "Главная" },
  { href: "/knowledge", label: "База знаний" },
  { href: "/services", label: "Сервисы БПО" },
  { href: "/processes", label: "Процессы" },
];

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-index-dropdown)",
        background: "var(--color-background-primary)",
        borderBottom: "1px solid var(--color-background-secondary)",
        boxShadow: "var(--shadow-low)",
      }}
    >
      <div
        style={{
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Лого */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "MTS Wide",
              fontWeight: 700,
              fontSize: "20px",
              color: "var(--brand-blue)",
              letterSpacing: "-0.3px",
            }}
          >
            МГТС
          </span>
        </Link>

        {/* Навигация */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            flex: 1,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* Правая часть */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <AppLauncher />
          <SearchBar />
          <ThemeToggle />
          <div style={{ width: "1px", height: "24px", background: "var(--color-background-secondary)", margin: "0 8px" }} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
