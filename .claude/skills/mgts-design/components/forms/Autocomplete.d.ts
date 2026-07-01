import * as React from 'react';

export interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: string) => void;
  options: string[];
  disabled?: boolean;
  size?: 's' | 'm' | 'l';
  style?: React.CSSProperties;
}

export declare function Autocomplete(props: AutocompleteProps): JSX.Element;
export default Autocomplete;
