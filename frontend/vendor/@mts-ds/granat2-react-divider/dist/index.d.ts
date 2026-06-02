import * as React from 'react';

declare type DividerProps = {
    /** Добавляет отступ сверху */
    withMargin?: boolean;
    className?: string;
} & React.ComponentPropsWithoutRef<'hr'>;
declare const Divider: React.ForwardRefExoticComponent<{
    /** Добавляет отступ сверху */
    withMargin?: boolean | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>, "key" | keyof React.HTMLAttributes<HTMLHRElement>> & React.RefAttributes<HTMLHRElement>>;

export { Divider, DividerProps };
