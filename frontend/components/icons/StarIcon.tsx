import { Icon } from "./Icon";
import type React from "react";

export function StarIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="StarSize24StyleOutline" size={size} className={className} style={style} />;
}
