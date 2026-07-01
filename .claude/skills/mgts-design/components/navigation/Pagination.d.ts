import * as React from 'react';

export interface PaginationProps {
  count: number;
  active?: number;
  onChange?: (index: number) => void;
  style?: React.CSSProperties;
}

export declare function Pagination(props: PaginationProps): JSX.Element;
export default Pagination;
