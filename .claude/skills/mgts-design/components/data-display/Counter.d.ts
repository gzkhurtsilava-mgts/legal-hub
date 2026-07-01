import * as React from 'react';

export interface CounterProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'negative' | 'neutral';
  style?: React.CSSProperties;
}

export declare function Counter(props: CounterProps): JSX.Element;
export default Counter;
