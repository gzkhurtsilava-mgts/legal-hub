"use client";

import { useRef, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, NoGenderIcon } from "@mts-ds/granat2-react-avatar";
import { Button } from "@mts-ds/granat2-react-button";
import { ChevronDownIcon, ExitIcon } from "@/components/icons";

const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  lawyer: "Юрист",
  manager: "Менеджер",
  employee: "Сотрудник",
  guest: "Гость",
};

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status === "loading") return <div style={{ width: "120px" }} />;

  if (!session) return <Button onClick={() => router.push("/login")}>Войти</Button>;

  const nameParts = (session.user.name ?? "").split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts[1] ?? "";
  const roleLabel = ROLE_LABELS[session.user.role] ?? session.user.role;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-s)", userSelect: "none" }}
      >
        <Avatar size={32} firstName={firstName} lastName={lastName} icon={NoGenderIcon} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "MTS Compact", fontWeight: 500, fontSize: "14px", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
            {session.user.name}
          </span>
          <span style={{ fontFamily: "MTS Compact", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.2 }}>
            {roleLabel}
          </span>
        </div>
        <ChevronDownIcon
          size={16}
          style={{
            color: "var(--color-icons-secondary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
            flexShrink: 0,
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "180px",
            background: "var(--color-background-primary)",
            borderRadius: "var(--radius-m)",
            boxShadow: "var(--shadow-middle)",
            border: "1px solid var(--color-background-secondary)",
            overflow: "hidden",
            zIndex: "var(--z-index-modal)",
          }}
        >
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/login" }); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "MTS Compact",
              fontSize: "14px",
              color: "var(--color-text-primary)",
              textAlign: "left",
            }}
            className="ui-hover-bg"
          >
            <ExitIcon size={16} style={{ color: "var(--color-icons-secondary)" }} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
