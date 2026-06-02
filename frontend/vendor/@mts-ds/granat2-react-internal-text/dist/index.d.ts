import * as React from 'react';
import { ElementType, ReactNode, ComponentProps, ReactElement } from 'react';

declare type TextBaseProps<E extends ElementType = ElementType> = {
    /** Шрифт текста */
    font?: 'p3-medium-comp' | 'p4-regular-comp' | 'p4-medium-comp' | 'p4-bold-upp-wide' | 'c1-regular-comp' | 'c1-medium-comp' | 'c1-bold-upp-wide' | 'c2-bold-upp-wide';
    /** Цвет текста. Можно передавать только цветовой токен из дизайн-системы. Например, text-primary, constant-greyscale-0 */
    color?: string;
    /** Тэг, в который обернут текст */
    as?: E;
    /** Скрытие текста, который не помещается в заданную область */
    truncate?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;
};

declare type TextComponent<E extends ElementType> = TextBaseProps<E> & Omit<ComponentProps<E>, keyof TextBaseProps>;
declare type TextProps = <E extends ElementType = 'span'>(props: TextComponent<E>) => ReactElement | null;
declare const Text: TextProps;
//# sourceMappingURL=text.d.ts.map

declare const useTextClass: ({ font, truncate, className, }: Pick<TextBaseProps, 'font' | 'truncate' | 'className'>) => string;

export { Text, TextBaseProps, TextComponent, TextProps, useTextClass };
