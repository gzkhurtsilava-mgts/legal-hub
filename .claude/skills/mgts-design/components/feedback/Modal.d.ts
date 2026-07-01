import * as React from 'react';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  style?: React.CSSProperties;
}

export declare function Modal(props: ModalProps): JSX.Element | null;
export default Modal;
