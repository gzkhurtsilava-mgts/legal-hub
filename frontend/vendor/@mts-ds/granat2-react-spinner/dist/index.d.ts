import * as React from 'react';

declare type SpinnerProps = {
    /** Цвет спинера, по умолчанию 'default' */
    color?: 'default' | 'inverted' | 'accent' | 'negative' | 'white' | 'black';
    /** Размер спинера, по умолчанию '24' */
    size?: 16 | 24 | 44;
    className?: string;
} & React.ComponentPropsWithoutRef<'span'>;
declare const Spinner: React.ForwardRefExoticComponent<{
    /** Цвет спинера, по умолчанию 'default' */
    color?: "default" | "inverted" | "accent" | "negative" | "white" | "black" | undefined;
    /** Размер спинера, по умолчанию '24' */
    size?: 16 | 24 | 44 | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "key" | keyof React.HTMLAttributes<HTMLSpanElement>> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=spinner.d.ts.map

export { Spinner, SpinnerProps };
