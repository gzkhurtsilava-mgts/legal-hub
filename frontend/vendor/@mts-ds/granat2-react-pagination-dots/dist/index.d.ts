import * as React from 'react';
import { ReactElement } from 'react';

declare type DotProps = {
    isActive?: boolean;
    className?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare const Dot: React.ForwardRefExoticComponent<{
    isActive?: boolean | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLDivElement>>;

declare type PaginationDotsProps = {
    /** Фон, на котором используется компонент */
    contextBackground?: 'primary' | 'alternative';
    children: ReactElement<DotProps>[];
    className?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare const PaginationDots: React.ForwardRefExoticComponent<{
    /** Фон, на котором используется компонент */
    contextBackground?: "primary" | "alternative" | undefined;
    children: ReactElement<DotProps>[];
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLDivElement>>;

export { Dot, DotProps, PaginationDots, PaginationDotsProps };
