import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  size?: 's' | 'm' | 'l';
  status?: 'online' | 'busy' | 'away';
}

export declare function Avatar(props: AvatarProps): JSX.Element;
export default Avatar;
