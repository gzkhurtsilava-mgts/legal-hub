import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface MenuItem {
  label?: string;
  icon?: IconName;
  onClick?: () => void;
  tone?: 'default' | 'negative';
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

export interface MenuProps {
  items: MenuItem[];
  style?: React.CSSProperties;
}

export declare function Menu(props: MenuProps): JSX.Element;
export default Menu;
