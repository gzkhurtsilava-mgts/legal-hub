import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface ButtonPriceProps {
  label: string;
  price: string;
  period?: string;
  variant?: 'primary' | 'secondary';
  size?: 'm' | 'l';
  iconLeft?: IconName;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export declare function ButtonPrice(props: ButtonPriceProps): JSX.Element;
export default ButtonPrice;
