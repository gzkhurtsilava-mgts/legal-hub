import * as React from 'react';

export interface Segment { value: string; label: string; }

export interface SegmentedControlProps {
  segments: Array<Segment | string>;
  value?: string;
  onChange?: (value: string) => void;
  size?: 's' | 'm';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
export default SegmentedControl;
