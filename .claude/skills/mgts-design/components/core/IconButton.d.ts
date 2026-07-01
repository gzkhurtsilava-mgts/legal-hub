import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 's' | 'm' | 'l';
  disabled?: boolean;
  ariaLabel?: string;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
export default IconButton;
