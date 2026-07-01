import * as React from 'react';

export interface TabItem { value: string; label: string; }

export interface TabsProps {
  tabs: Array<TabItem | string>;
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

export declare function Tabs(props: TabsProps): JSX.Element;
export default Tabs;
