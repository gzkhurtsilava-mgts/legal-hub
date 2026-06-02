import * as React from 'react';
import { ComponentPropsWithoutRef, ReactElement } from 'react';
export { DoneIcon, ErrorIcon, InfoIcon, WarningIcon } from '@mts-ds/granat2-react-internal-banner-icons';

interface BannerProps extends ComponentPropsWithoutRef<'div'> {
    /** Описание */
    description: string;
    /** Цвет баннера */
    variant?: 'grey' | 'inverted';
    /** Иконка - обязательный элемент.
     * Поддерживается 4 типа иконок: InfoIcon, DoneIcon, ErrorIcon, WarningIcon.
     */
    icon: ReactElement<{
        inverted?: boolean;
    }>;
}
declare const Banner: React.ForwardRefExoticComponent<BannerProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=banner-tertiary.d.ts.map

export { Banner, BannerProps };
