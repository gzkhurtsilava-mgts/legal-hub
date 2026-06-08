import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/knowledge", label: "База знаний" },
  { href: "/services", label: "Сервисы БПО" },
  { href: "/processes", label: "Процессы" },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-background-secondary)",
        background: "var(--color-background-primary)",
        padding: "20px 24px",
        position: "relative",
        zIndex: "var(--z-index-dropdown)" as React.CSSProperties["zIndex"],
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="footer-link">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
