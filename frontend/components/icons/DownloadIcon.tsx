import { Icon } from "./Icon";
import type React from "react";

export function DownloadIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return <Icon name="DownloadSize24StyleOutline" size={size} style={style} />;
}
