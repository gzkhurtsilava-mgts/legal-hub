"use client";

import { useRef, useState } from "react";
import { ButtonIcon } from "@mts-ds/granat2-react-button";
import { SearchIcon, CrossIcon } from "@/components/icons";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 310);
  };

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div
        style={{
          overflow: "hidden",
          width: open ? "220px" : "0px",
          opacity: open ? 1 : 0,
          transition: "width 300ms ease, opacity 300ms ease",
        }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Поиск..."
          onKeyDown={(e) => e.key === "Escape" && handleClose()}
          style={{
            width: "220px",
            height: "36px",
            padding: "0 12px",
            border: "1.5px solid var(--brand-blue)",
            borderRadius: "var(--radius-s)",
            fontFamily: "MTS Compact",
            fontSize: "14px",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
      </div>

      {open ? (
        <ButtonIcon size={32} variant="ghost" contextBackgroundColor="primary" aria-label="Закрыть поиск" onClick={handleClose}>
          <CrossIcon size={20} />
        </ButtonIcon>
      ) : (
        <ButtonIcon size={32} variant="ghost" contextBackgroundColor="primary" aria-label="Открыть поиск" onClick={handleOpen}>
          <SearchIcon size={20} />
        </ButtonIcon>
      )}
    </div>
  );
}
