import { Icon } from "./Icon";
import type React from "react";

export function ChevronDownIcon({ size = 24, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <Icon name="TriangleArrowDownSize24StyleFill" size={size} className={className} style={style} />;
}
