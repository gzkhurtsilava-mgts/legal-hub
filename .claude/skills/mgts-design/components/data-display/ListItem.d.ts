import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface ListItemProps {
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  size?: 's' | 'm' | 'l';
  style?: React.CSSProperties;
}

export declare function ListItem(props: ListItemProps): JSX.Element;
export default ListItem;
