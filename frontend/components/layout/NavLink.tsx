"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      style={{
        fontFamily: "MTS Compact",
        fontWeight: isActive ? 500 : 400,
        fontSize: "15px",
        color: isActive ? "var(--brand-blue)" : "var(--color-text-primary)",
        textDecoration: "none",
        paddingBottom: "2px",
        borderBottom: isActive ? "2px solid var(--brand-blue)" : "2px solid transparent",
        transition: "color 200ms, border-color 200ms",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}
