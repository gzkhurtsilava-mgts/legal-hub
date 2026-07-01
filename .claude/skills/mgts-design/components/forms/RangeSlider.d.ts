import * as React from 'react';

export interface RangeSliderProps {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValues?: boolean;
  format?: (v: number) => React.ReactNode;
  style?: React.CSSProperties;
}

export declare function RangeSlider(props: RangeSliderProps): JSX.Element;
export default RangeSlider;
