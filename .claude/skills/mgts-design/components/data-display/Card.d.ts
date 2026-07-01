import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  radius?: 'm' | 'l';
  padding?: number | string;
  children?: React.ReactNode;
}

export declare function Card(props: CardProps): JSX.Element;
export default Card;
