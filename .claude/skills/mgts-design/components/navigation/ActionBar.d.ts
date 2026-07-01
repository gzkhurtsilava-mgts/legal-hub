import * as React from 'react';

export interface ActionBarProps {
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'between' | 'center';
  sticky?: boolean;
  style?: React.CSSProperties;
}

export declare function ActionBar(props: ActionBarProps): JSX.Element;
export default ActionBar;
