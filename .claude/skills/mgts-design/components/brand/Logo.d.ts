import * as React from 'react';
export interface LogoProps {
  variant?: 'full' | 'mark' | 'text';
  tone?: 'brand' | 'mono' | 'inverted';
  size?: number;
  style?: React.CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
export default Logo;
