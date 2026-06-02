import * as React from 'react';

declare type ProgressLinearProps = {
    /** Значение индикатора, целое число от 0 до 100 */
    value: number;
    /** Размер компонента */
    size?: 's' | 'm' | 'l';
    /** Отображение процентов для размеров s и m */
    withPercent?: boolean;
    /** Состояние индикатора */
    status?: 'loading' | 'success' | 'pause' | 'error';
    /** Вспомогательный текст под индикатором для success, pause, error.
     * В размере l отображается только для состояния error
     */
    statusText?: string;
    className?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare const ProgressLinear: React.ForwardRefExoticComponent<{
    /** Значение индикатора, целое число от 0 до 100 */
    value: number;
    /** Размер компонента */
    size?: "s" | "m" | "l" | undefined;
    /** Отображение процентов для размеров s и m */
    withPercent?: boolean | undefined;
    /** Состояние индикатора */
    status?: "loading" | "success" | "pause" | "error" | undefined;
    /** Вспомогательный текст под индикатором для success, pause, error.
     * В размере l отображается только для состояния error
     */
    statusText?: string | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=progress-linear.d.ts.map

export { ProgressLinear, ProgressLinearProps };
