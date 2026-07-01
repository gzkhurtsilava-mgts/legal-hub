import * as React from 'react';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label?: string;
  description?: string;
  error?: string;
  value?: string;
  rows?: number;
  maxLength?: number;
}

export declare function Textarea(props: TextareaProps): JSX.Element;
export default Textarea;
