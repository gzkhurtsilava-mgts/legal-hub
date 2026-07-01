import { Icon } from "./Icon";
import type React from "react";

export function SearchIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="SearchSize24StyleOutline" size={size} className={className} style={style} />;
}
