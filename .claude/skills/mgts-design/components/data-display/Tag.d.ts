import * as React from 'react';
import { IconName } from '../../assets/icons/Icon';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: IconName;
  onRemove?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
}

export declare function Tag(props: TagProps): JSX.Element;
export default Tag;
