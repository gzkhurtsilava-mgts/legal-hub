import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface SidebarNavProps {
  icon?: IconName;
  label: string;
  active?: boolean;
  badge?: number | string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
export default SidebarNav;
