"use client";

import { useEffect, useState } from "react";
import { Switch } from "@mts-ds/granat2-react-switch";
import { LightModeIcon } from "@/components/icons";
import { NightModeIcon } from "@/components/icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleChange = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <LightModeIcon size={16} style={{ color: !dark ? "var(--brand-blue)" : "var(--color-icons-secondary)", transition: "color 200ms" }} />
      <Switch
        checked={dark}
        onChange={handleChange}
        size={16}
        ariaLabel="Переключить тему"
      />
      <NightModeIcon size={16} style={{ color: dark ? "var(--brand-blue)" : "var(--color-icons-secondary)", transition: "color 200ms" }} />
    </div>
  );
}
