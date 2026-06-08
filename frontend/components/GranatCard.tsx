import type { HTMLAttributes } from "react";
import { Card as _Card } from "@mts-ds/granat2-react-card";

export type GranatCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: string;
  device?: string;
  size?: string;
  cornerRadius?: number;
};

// Cast needed: after removing nested @types/react@17 from @mts-ds packages,
// TypeScript resolves Card's union type against React 18 types and incorrectly
// marks onPointerEnterCapture, onPointerLeaveCapture, placeholder as required.
export const Card = _Card as unknown as React.ComponentType<GranatCardProps>;
