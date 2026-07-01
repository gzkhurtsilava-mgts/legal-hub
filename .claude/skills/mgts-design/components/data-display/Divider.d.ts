import * as React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  spacing?: number;
  style?: React.CSSProperties;
}

export declare function Divider(props: DividerProps): JSX.Element;
export default Divider;
