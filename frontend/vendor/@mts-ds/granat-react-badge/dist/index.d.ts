import * as React from 'react';
import { ReactNode, ReactElement } from 'react';

declare type MtsDsBadgeIconProps = {
    /** Иконка для компонента Badge */
    children: ReactNode;
};
declare function MtsDsBadgeIcon({ children }: MtsDsBadgeIconProps): JSX.Element;

declare type BadgeSize = 'xs' | 's' | 'm' | 'l';
declare type BadgeTextColor = 'primary' | 'secondary' | 'light';
declare type BadgeProps = {
    /** Размер компонента */
    size?: BadgeSize;
    /** Цвет фона, можно указать только токен из пакета base */
    backgroundColor?: string;
    /** Цвет текста */
    textColor?: BadgeTextColor;
    /** Текст или компонент MtsDsBadgeIcon и текст если беидж должен быть с иконкой */
    children: string | Array<ReactElement<MtsDsBadgeIconProps> | string>;
};
/**
 * Компонент Badge
 */
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=badge.d.ts.map

export { Badge, BadgeProps, BadgeSize, BadgeTextColor, Badge as MtsDsBadge, MtsDsBadgeIcon, MtsDsBadgeIconProps, BadgeProps as MtsDsBadgeProps };
