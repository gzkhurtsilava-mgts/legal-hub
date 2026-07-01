import { Icon } from "./Icon";
import type React from "react";

export function DocumentIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="DocumentSize24StyleOutline" size={size} className={className} style={style} />;
}
