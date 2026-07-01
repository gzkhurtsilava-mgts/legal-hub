import * as React from 'react';

export interface ToastProps {
  tone?: 'info' | 'positive' | 'warning' | 'negative';
  title?: string;
  description?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export declare function Toast(props: ToastProps): JSX.Element;
export default Toast;
