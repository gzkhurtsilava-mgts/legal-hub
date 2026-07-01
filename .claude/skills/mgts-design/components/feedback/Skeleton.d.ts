import * as React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
}

export declare function Skeleton(props: SkeletonProps): JSX.Element;
export default Skeleton;
