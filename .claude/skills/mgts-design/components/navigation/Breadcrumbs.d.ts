import * as React from 'react';

export interface Crumb { label: string; onClick?: () => void; }

export interface BreadcrumbsProps {
  items: Crumb[];
  style?: React.CSSProperties;
}

export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
export default Breadcrumbs;
