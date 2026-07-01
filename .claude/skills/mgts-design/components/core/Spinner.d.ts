import * as React from 'react';

export interface SpinnerProps {
  size?: 's' | 'm' | 'l' | 'xl';
  tone?: 'brand' | 'inverted' | 'secondary';
  style?: React.CSSProperties;
}

export declare function Spinner(props: SpinnerProps): JSX.Element;
export default Spinner;
