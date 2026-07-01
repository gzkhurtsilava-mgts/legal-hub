import * as React from 'react';

export interface TextListProps {
  items: React.ReactNode[];
  type?: 'bullet' | 'number';
  style?: React.CSSProperties;
}

export declare function TextList(props: TextListProps): JSX.Element;
export default TextList;
