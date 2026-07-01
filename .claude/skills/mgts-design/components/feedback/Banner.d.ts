import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface BannerProps {
  tone?: 'info' | 'positive' | 'warning' | 'negative' | 'neutral';
  title?: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export declare function Banner(props: BannerProps): JSX.Element;
export default Banner;
