import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'negative';
  /** @default "m" */
  size?: 'xs' | 's' | 'm' | 'l';
  iconLeft?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export declare function Button(props: ButtonProps): JSX.Element;
export default Button;
