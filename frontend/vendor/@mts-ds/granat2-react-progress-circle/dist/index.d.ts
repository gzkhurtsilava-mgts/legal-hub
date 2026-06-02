import * as React from 'react';
import { ComponentPropsWithoutRef } from 'react';

interface ProgressCircleProps extends ComponentPropsWithoutRef<'div'> {
    /** Значение индикатора, целое число от 0 до 100 */
    value: number;
    /** Размер компонента */
    size?: 's' | 'm' | 'l';
    /** Состояние индикатора */
    status?: 'loading' | 'success' | 'pause' | 'error';
    /** Вспомогательный текст под индикатором для pause, error */
    statusText?: string;
}
declare const ProgressCircle: React.ForwardRefExoticComponent<ProgressCircleProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=progress-circle.d.ts.map

export { ProgressCircle, ProgressCircleProps };
