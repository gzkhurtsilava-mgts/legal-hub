import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface StickyBannerProps {
  tone?: 'brand' | 'info' | 'warning' | 'neutral';
  message: React.ReactNode;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export declare function StickyBanner(props: StickyBannerProps): JSX.Element;
export default StickyBanner;
