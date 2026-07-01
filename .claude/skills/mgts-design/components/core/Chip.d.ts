import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface ChipProps {
  children?: React.ReactNode;
  icon?: IconName;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 's' | 'm';
  style?: React.CSSProperties;
}

export declare function Chip(props: ChipProps): JSX.Element;
export default Chip;
