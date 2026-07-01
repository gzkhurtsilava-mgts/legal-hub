import * as React from 'react';

export interface StepperProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 's' | 'm';
  style?: React.CSSProperties;
}

export declare function Stepper(props: StepperProps): JSX.Element;
export default Stepper;
