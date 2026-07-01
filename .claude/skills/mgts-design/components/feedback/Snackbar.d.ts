import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface SnackbarProps {
  tone?: 'neutral' | 'positive' | 'negative' | 'warning';
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export declare function Snackbar(props: SnackbarProps): JSX.Element;
export default Snackbar;
