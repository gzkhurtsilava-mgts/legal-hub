import * as React from 'react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value?: string;
  onClear?: () => void;
  placeholder?: string;
  size?: 's' | 'm' | 'l';
  filled?: boolean;
}

export declare function SearchInput(props: SearchInputProps): JSX.Element;
export default SearchInput;
