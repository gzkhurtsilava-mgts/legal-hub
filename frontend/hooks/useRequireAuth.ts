"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type UserRole = "admin" | "lawyer" | "manager" | "employee" | "guest";

export function useRequireAuth(requiredRoles?: UserRole[]) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
      router.push("/login");
    }
  }, [session, status, router, requiredRoles]);

  return session?.user ?? null;
}
