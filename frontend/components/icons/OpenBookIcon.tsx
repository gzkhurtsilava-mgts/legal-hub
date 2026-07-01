import { Icon } from "./Icon";
import type React from "react";

export function OpenBookIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="OpenBookSize24StyleOutline" size={size} className={className} style={style} />;
}
