import { Icon } from "./Icon";
import type React from "react";

export function LinkIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="LinkSize24StyleOutline" size={size} className={className} style={style} />;
}
