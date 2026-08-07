import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PresentPanel } from "@/components/present/PresentPanel";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="portal-shell"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-background-lower)",
      }}
    >
      <PresentPanel />
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
