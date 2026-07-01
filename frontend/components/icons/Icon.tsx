import icons from "@/lib/icons/icon-data";
import type React from "react";

export type IconName = string;

const iconMap = icons as Record<string, { viewBox: string; body: string }>;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export function Icon({ name, size = 24, ...rest }: IconProps) {
  const d = iconMap[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={d.viewBox}
      fill="none"
      // body contains only geometry <path> elements with currentColor — safe to inject
      dangerouslySetInnerHTML={{ __html: d.body }}
      {...rest}
    />
  );
}
