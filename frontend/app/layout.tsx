import type { Metadata } from "next";
// ВАЖНО: theme.css должен быть ПЕРВЫМ — globals.css переопределяет его токены под МГТС-синий
// eslint-disable-next-line import/order
import '@mts-ds/granat2-react-root/theme.css';
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