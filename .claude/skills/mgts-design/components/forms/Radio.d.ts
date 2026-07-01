import * as React from 'react';

export interface RadioProps {
  checked?: boolean;
  onChange?: (value: string | boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  style?: React.CSSProperties;
}

export declare function Radio(props: RadioProps): JSX.Element;
export default Radio;
