import * as React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: Array<SelectOption | string>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  size?: 's' | 'm' | 'l';
  style?: React.CSSProperties;
}

export declare function Select(props: SelectProps): JSX.Element;
export default Select;
