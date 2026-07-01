import { Icon } from "./Icon";
import type React from "react";

export function InfoIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return <Icon name="InfoCircleSize24StyleOutline" size={size} style={style} />;
}
