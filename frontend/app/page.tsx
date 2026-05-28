"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@mts-ds/granat2-react-button";

const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  lawyer: "Юрист",
  manager: "Менеджер",
  employee: "Сотрудник",
  guest: "Гость",
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <main style={{ padding: "2rem", background: "var(--color-background-lower)", minHeight: "100vh" }}>
        <p style={{ color: "var(--color-text-secondary)", fontFamily: "MTS Compact" }}>Загрузка...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", background: "var(--color-background-lower)", minHeight: "100vh" }}>
      <h1 style={{ fontFamily: "MTS Wide", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
        Legal Hub
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", fontFamily: "MTS Compact" }}>
        Портал БПО МГТС
      </p>

      {session ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
          <div
            style={{
              background: "var(--color-background-primary)",
              borderRadius: "var(--radius-m)",
              padding: "20px",
              boxShadow: "var(--shadow-low)",
            }}
          >
            <p style={{ fontFamily: "MTS Compact", fontWeight: 500, marginBottom: "4px" }}>
              {session.user.name}
            </p>
            <p style={{ fontFamily: "MTS Compact", fontSize: "14px", color: "var(--color-text-secondary)" }}>
              {session.user.email}
            </p>
            <p
              style={{
                fontFamily: "MTS Compact",
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
                marginTop: "8px",
              }}
            >
              Роль: {ROLE_LABELS[session.user.role] ?? session.user.role}
            </p>
          </div>
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
            Выйти
          </Button>
        </div>
      ) : (
        <Button onClick={() => router.push("/login")}>Войти</Button>
      )}
    </main>
  );
}
