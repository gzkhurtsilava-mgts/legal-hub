import * as React from 'react';
import { ReactNode } from 'react';

declare type LinkProps = {
    /** Иконка */
    icon?: ReactNode;
    /** Размер ссылки. По умолчанию 16 */
    size?: 16 | 20 | 24;
    /** Цвет текста ссылки */
    color?: 'primary' | 'secondary' | 'black' | 'white' | 'inverted';
    /** Подчеркивание ссылки. По умолчанию подчеркивания нет. Работает только в случае, если нет иконки. Если иконка есть, подчеркивания не будет. */
    underline?: 'none' | 'solid' | 'dashed';
    /** Текст ссылки  */
    children: string;
    /** Позиция иконки, может быть спереди линка или сзади */
    iconPosition: 'begin' | 'end';
    /** Ссылка */
    href: string;
    className?: string;
} & React.ComponentPropsWithoutRef<'a'>;
/**
 * Компонент Link
 */
declare const Link: React.ForwardRefExoticComponent<{
    /** Иконка */
    icon?: ReactNode;
    /** Размер ссылки. По умолчанию 16 */
    size?: 16 | 20 | 24 | undefined;
    /** Цвет текста ссылки */
    color?: "primary" | "secondary" | "black" | "white" | "inverted" | undefined;
    /** Подчеркивание ссылки. По умолчанию подчеркивания нет. Работает только в случае, если нет иконки. Если иконка есть, подчеркивания не будет. */
    underline?: "none" | "solid" | "dashed" | undefined;
    /** Текст ссылки  */
    children: string;
    /** Позиция иконки, может быть спереди линка или сзади */
    iconPosition: 'begin' | 'end';
    /** Ссылка */
    href: string;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "key" | keyof React.AnchorHTMLAttributes<HTMLAnchorElement>> & React.RefAttributes<HTMLAnchorElement>>;

export { Link, LinkProps };
