import * as React from 'react';

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function CodeInput(props: CodeInputProps): JSX.Element;
export default CodeInput;
