import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface FormChipProps {
  children?: React.ReactNode;
  icon?: IconName;
  onRemove?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function FormChip(props: FormChipProps): JSX.Element;
export default FormChip;
