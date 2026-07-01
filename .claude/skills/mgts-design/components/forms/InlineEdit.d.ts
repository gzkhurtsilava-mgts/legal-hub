import * as React from 'react';

export interface InlineEditProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function InlineEdit(props: InlineEditProps): JSX.Element;
export default InlineEdit;
