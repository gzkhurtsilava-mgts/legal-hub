import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
  error?: string;
  disabled?: boolean;
  size?: 's' | 'm' | 'l';
  iconLeft?: IconName;
  iconRight?: IconName;
  type?: string;
}

export declare function TextField(props: TextFieldProps): JSX.Element;
export default TextField;
