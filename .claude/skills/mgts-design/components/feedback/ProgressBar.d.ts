import * as React from 'react';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  showValue?: boolean;
  tone?: 'brand' | 'positive' | 'warning';
  style?: React.CSSProperties;
}

export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
export default ProgressBar;
