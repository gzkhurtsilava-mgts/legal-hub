"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

interface Props {
  initialUrl: string;
  onSave: (url: string) => void;
  isSaving: boolean;
}

export function LinkEditor({ initialUrl, onSave, isSaving }: Props) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const isValid = url.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ display: "block", fontFamily: "MTS Compact", fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "6px" }}>
          URL ресурса
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: "100%",
            padding: "10px 14px",
            fontFamily: "MTS Compact",
            fontSize: "15px",
            color: "var(--color-text-primary)",
            background: "var(--color-background-primary)",
            border: "1.5px solid var(--color-background-lower)",
            borderRadius: "var(--radius-m)",
            outline: "none",
            boxSizing: "border-box",
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
        />
      </div>

      <div>
        <Button size="s" onClick={handleSave} disabled={isSaving || !isValid}>
          {isSaving ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
