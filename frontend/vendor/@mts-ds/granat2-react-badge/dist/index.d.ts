import * as React from 'react';
import { ReactElement } from 'react';

declare type BadgeSize = 16 | 20 | 24 | 32;
declare type BadgeProps = {
    /** Размер компонента */
    size?: BadgeSize;
    /** Цвет фона, можно указать только токен из пакета base */
    backgroundColor?: string;
    /** Цвет текста, можно указать только токен из пакета base */
    textColor?: string;
    /** Иконка */
    icon?: ReactElement;
    /** Цвет иконки, можно указать только токен из пакета base */
    iconColor?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Текст */
    children: string;
} & React.ComponentPropsWithoutRef<'span'>;
/**
 * Компонент Badge
 */
declare const Badge: React.ForwardRefExoticComponent<{
    /** Размер компонента */
    size?: BadgeSize | undefined;
    /** Цвет фона, можно указать только токен из пакета base */
    backgroundColor?: string | undefined;
    /** Цвет текста, можно указать только токен из пакета base */
    textColor?: string | undefined;
    /** Иконка */
    icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
    /** Цвет иконки, можно указать только токен из пакета base */
    iconColor?: string | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
    /** Текст */
    children: string;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "key" | keyof React.HTMLAttributes<HTMLSpanElement>> & React.RefAttributes<HTMLDivElement>>;

export { Badge, BadgeProps, BadgeSize };
