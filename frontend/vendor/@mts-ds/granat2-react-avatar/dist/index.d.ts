/// <reference types="react" />
import * as React from 'react';
import { MouseEventHandler, ReactElement, ImgHTMLAttributes, JSXElementConstructor } from 'react';

declare type AvatarSize = 24 | 32 | 44 | 52 | 64 | 80;
declare type AvatarProps = {
    /**
     * Размер аватара
     *
     * Значения: 24, 32, 44, 52, 64 (по умолчанию), 80
     *
     * Для кастомного размера значение нужно указывать вместе и единицами измерения, например `100px`.
     * При этом базовый размер будет равен `80`
     *
     * @default 64
     */
    size?: AvatarSize | `${number}${string}`;
    /** Иконка */
    icon?: JSX.Element;
    /** Фамилия */
    lastName?: string;
    /** Имя */
    firstName?: string;
    /** Обработчик события клика */
    onClick?: MouseEventHandler<HTMLImageElement>;
    children?: ReactElement<ImgHTMLAttributes<HTMLImageElement>, JSXElementConstructor<HTMLImageElement>>;
    className?: string;
    style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<'div'>;
/**
 * Компонент Avatar
 */
declare const Avatar: React.ForwardRefExoticComponent<{
    /**
     * Размер аватара
     *
     * Значения: 24, 32, 44, 52, 64 (по умолчанию), 80
     *
     * Для кастомного размера значение нужно указывать вместе и единицами измерения, например `100px`.
     * При этом базовый размер будет равен `80`
     *
     * @default 64
     */
    size?: AvatarSize | `${number}${string}` | undefined;
    /** Иконка */
    icon?: JSX.Element | undefined;
    /** Фамилия */
    lastName?: string | undefined;
    /** Имя */
    firstName?: string | undefined;
    /** Обработчик события клика */
    onClick?: React.MouseEventHandler<HTMLImageElement> | undefined;
    children?: React.ReactElement<React.ImgHTMLAttributes<HTMLImageElement>, React.JSXElementConstructor<HTMLImageElement>> | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLImageElement>>;
//# sourceMappingURL=avatar.d.ts.map

declare const ManIcon: JSX.Element;

declare const WomanIcon: JSX.Element;

declare const NoGenderIcon: JSX.Element;

declare const BusinessIcon: JSX.Element;

export { Avatar, AvatarProps, AvatarSize, BusinessIcon, ManIcon, NoGenderIcon, WomanIcon };
