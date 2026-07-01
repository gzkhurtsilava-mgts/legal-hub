import { Icon } from "./Icon";
import type React from "react";

export function EditIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return <Icon name="EditSize24StyleOutline" size={size} style={style} />;
}
