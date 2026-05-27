import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ru">
      <body className="mtsds-vars mgts-corai-vars">
        {children}
      </body>
    </html>
  );
}