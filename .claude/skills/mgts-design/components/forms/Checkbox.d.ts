import * as React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;
export default Checkbox;
