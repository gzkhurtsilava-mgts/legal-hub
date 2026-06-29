"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/icons";
import { IconButton, SegmentedControl } from "@/components/ui";
import { appsForTab, hasTabs, type AppTab } from "@/lib/apps";

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AppTab>("law");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const showTabs = hasTabs(role);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const apps = showTabs ? appsForTab(tab) : appsForTab("business");

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "flex" }}>
      <IconButton size={32} label="Приложения" onClick={() => setOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
      </IconButton>

      {open && (
        <div className="ui-applauncher" role="menu">
          <p className="ui-applauncher__title">Приложения</p>
          {showTabs && (
            <div style={{ marginBottom: "12px" }}>
              <SegmentedControl
                size="s"
                segments={[
                  { value: "law", label: "Право" },
                  { value: "business", label: "Бизнес" },
                ]}
                value={tab}
                onChange={(v) => setTab(v as AppTab)}
              />
            </div>
          )}
          <div className="ui-applauncher__grid">
            {apps.map((app) => (
              <button key={app.id} className="ui-applauncher__tile" onClick={() => go(app.href)}>
                <span className="ui-applauncher__icon">
                  <Icon name={app.icon} size={24} style={{ color: app.color }} />
                </span>
                <span className="ui-applauncher__label">{app.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
