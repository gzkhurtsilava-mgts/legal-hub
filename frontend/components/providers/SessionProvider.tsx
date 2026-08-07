"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // JWT-сессия живёт 8 часов и не меняется на сервере — перезапрашивать её при каждом
  // возврате фокуса в окно не нужно. Каждый такой запрос дёргает /api/auth/session
  // и в dev упирается в перекомпиляцию роута (наблюдались задержки до 6 с).
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </NextAuthSessionProvider>
  );
}
