import * as React from 'react';

export interface CollapsibleProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  style?: React.CSSProperties;
}

export declare function Collapsible(props: CollapsibleProps): JSX.Element;
export default Collapsible;
