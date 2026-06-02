import * as React from 'react';
import { ComponentPropsWithoutRef } from 'react';
export { DoneIcon, ErrorIcon, InfoIcon, WarningIcon } from '@mts-ds/granat2-react-internal-banner-icons';

declare type StickyBannerVariant = 'warning' | 'error' | 'success' | 'info';
declare type StickyBannerProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
    /** Основной заголовок баннера */
    title: React.ReactNode;
    /** Дополнительное описание/текст */
    description?: React.ReactNode;
    /** Вариант баннера, определяет цвет */
    variant?: StickyBannerVariant;
    /** Показать кнопку закрытия баннера */
    withCloseButton?: boolean;
    /** Показать иконку баннера */
    withIcon?: boolean;
    /** Управление состоянием видимости баннера */
    open?: boolean;
    /** Callback при изменении состояния открытости баннера */
    onOpenChange?: (open: boolean) => void;
    /** Кнопки действий */
    actions?: React.ReactNode;
};
declare const StickyBanner: React.ForwardRefExoticComponent<Omit<Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>>, "title"> & {
    /** Основной заголовок баннера */
    title: React.ReactNode;
    /** Дополнительное описание/текст */
    description?: React.ReactNode;
    /** Вариант баннера, определяет цвет */
    variant?: StickyBannerVariant | undefined;
    /** Показать кнопку закрытия баннера */
    withCloseButton?: boolean | undefined;
    /** Показать иконку баннера */
    withIcon?: boolean | undefined;
    /** Управление состоянием видимости баннера */
    open?: boolean | undefined;
    /** Callback при изменении состояния открытости баннера */
    onOpenChange?: ((open: boolean) => void) | undefined;
    /** Кнопки действий */
    actions?: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=sticky-banner.d.ts.map

export { StickyBanner, StickyBannerProps };
