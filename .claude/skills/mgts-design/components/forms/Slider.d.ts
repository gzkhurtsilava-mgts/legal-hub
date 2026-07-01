import * as React from 'react';

export interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  style?: React.CSSProperties;
}

export declare function Slider(props: SliderProps): JSX.Element;
export default Slider;
