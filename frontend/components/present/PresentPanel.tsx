"use client";

// Режим презентации: фиксированная панель слева (~20% экрана) с тезисами
// о продукте. Тезисы меняются автоматически по текущему маршруту.
// Включение: ?present=1 в URL или Alt+P. Выключение: ?present=0 или та же клавиша.
// Alt+P выбран сознательно: Ctrl+P/Ctrl+Shift+P заняты печатью в Chrome.
// Обычные пользователи панель не видят — состояние живёт в sessionStorage.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { resolvePresentContent } from "./presentContent";

const STORAGE_KEY = "legalhub.present";

export function PresentPanel() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // Активация через query-параметр + восстановление из sessionStorage
  useEffect(() => {
    const flag = new URLSearchParams(window.location.search).get("present");
    if (flag === "1") sessionStorage.setItem(STORAGE_KEY, "1");
    if (flag === "0") sessionStorage.removeItem(STORAGE_KEY);
    setActive(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // Горячая клавиша Alt+P — показать/скрыть (e.code — не зависит от раскладки)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyP") {
        e.preventDefault();
        setActive((prev) => {
          const next = !prev;
          if (next) sessionStorage.setItem(STORAGE_KEY, "1");
          else sessionStorage.removeItem(STORAGE_KEY);
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Сдвиг контента портала — через атрибут на <html> (см. globals.css)
  useEffect(() => {
    if (active) document.documentElement.setAttribute("data-present", "1");
    else document.documentElement.removeAttribute("data-present");
    return () => document.documentElement.removeAttribute("data-present");
  }, [active]);

  if (!active) return null;

  const section = resolvePresentContent(pathname ?? "/");

  return (
    <aside className="present-panel" aria-hidden>
      <div className="present-panel__brand">
        <div className="present-panel__logo">Legal Hub</div>
        <div className="present-panel__bar" />
        <div className="present-panel__tagline">
          Портал юридической поддержки МГТС
        </div>
      </div>

      <div className="present-panel__section" key={section.title}>
        <div className="present-panel__title">{section.title}</div>
        {section.lead && <div className="present-panel__lead">{section.lead}</div>}
        <ul className="present-panel__facts">
          {section.facts.map((fact) => (
            <li key={fact} className="present-panel__fact">
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="present-panel__footer">
        <div className="present-panel__hint">Alt+P — скрыть панель</div>
      </div>
    </aside>
  );
}
