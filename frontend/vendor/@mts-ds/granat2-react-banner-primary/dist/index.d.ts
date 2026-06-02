import * as React from 'react';
import { ComponentPropsWithoutRef } from 'react';
import { ButtonProps } from '@mts-ds/granat2-react-button';

interface BannerProps extends ComponentPropsWithoutRef<'div'> {
    /** Тип устройства */
    device?: 'mobile' | 'desktop';
    /** Цвет баннера */
    variant?: 'grey' | 'white';
    /** Размер шрифтов заголовка и описания */
    size?: 'normal' | 'small';
    /** Заголовок */
    title: string;
    /** Описание */
    description: string;
    /** Кнопка закрытия */
    withCloseButton?: boolean;
    /** Функция-обработчик клика на кнопку закрытия */
    onCloseClick?: () => void;
    /** Кнопки действия */
    actions: Array<ButtonProps>;
}
declare const Banner: React.ForwardRefExoticComponent<BannerProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=banner-primary.d.ts.map

export { Banner, BannerProps };
