import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'positive' | 'warning' | 'negative' | 'brand';
  children?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): JSX.Element;
export default Badge;
