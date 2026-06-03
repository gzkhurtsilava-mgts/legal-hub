import type { Metadata } from "next";
// ВАЖНО: theme.css должен быть ПЕРВЫМ — globals.css переопределяет его токены под МГТС-синий
// eslint-disable-next-line import/order
import '@mts-ds/granat2-react-root/theme.css';
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Legal Hub — Портал БПО",
  description: "Портал правового обеспечения МГТС",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="mtsds-vars mgts-corai-vars">
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}