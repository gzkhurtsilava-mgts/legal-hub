import * as React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export declare function Tooltip(props: TooltipProps): JSX.Element;
export default Tooltip;
