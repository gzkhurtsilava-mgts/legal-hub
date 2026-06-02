import * as React from 'react';
import { ComponentPropsWithoutRef, ReactElement } from 'react';
export { DoneIcon, ErrorIcon, InfoIcon, WarningIcon } from '@mts-ds/granat2-react-internal-banner-icons';

interface BannerProps extends ComponentPropsWithoutRef<'div'> {
    /** Тип устройства */
    device?: 'mobile' | 'desktop';
    /** Цвет баннера */
    variant?: 'grey' | 'white' | 'inverted';
    /** Заголовок */
    title: string;
    /** Описание */
    description: string;
    /** Текст ссылки */
    actionText?: string;
    /** Ссылка */
    actionHref?: string;
    /** Кнопка закрытия */
    withCloseButton?: boolean;
    /**  Функция-обработчик клика на кнопку закрытия */
    onCloseClick?: () => void;
    /** Иконка.
     * Поддерживается 4 типа иконок: InfoIcon, DoneIcon, ErrorIcon, WarningIcon.
     */
    icon?: ReactElement<{
        inverted?: boolean;
    }>;
}
declare const Banner: React.ForwardRefExoticComponent<BannerProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=banner-secondary.d.ts.map

export { Banner, BannerProps };
