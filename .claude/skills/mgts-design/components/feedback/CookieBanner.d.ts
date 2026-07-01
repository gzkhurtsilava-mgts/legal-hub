import * as React from 'react';

export interface CookieBannerProps {
  title?: string;
  message?: string;
  acceptLabel?: string;
  settingsLabel?: string;
  onAccept?: () => void;
  onSettings?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export declare function CookieBanner(props: CookieBannerProps): JSX.Element;
export default CookieBanner;
