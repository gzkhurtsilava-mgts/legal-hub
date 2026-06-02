import * as React from 'react';
import { ReactNode, SyntheticEvent, ButtonHTMLAttributes, ReactElement, FC } from 'react';
import { CounterProps } from '@mts-ds/granat2-react-counter';

declare type ButtonPriceVariant = 'primary' | 'primary-alternative' | 'always-white' | 'blur';
declare type ButtonVariant = ButtonPriceVariant | 'secondary' | 'ghost' | 'negative';
declare type ButtonIconVariant = ButtonVariant | 'scroll';
declare type ButtonIconSize = 24 | 32 | 44 | 52 | 72;
declare type ButtonSize = 24 | 32 | 44 | 52 | 72;
declare type ButtonPriceSize = 44 | 52 | 72;
declare type ButtonType = 'button' | 'reset' | 'submit';
declare type BaseButtonProps = {
    /** Цвет кнопки */
    variant?: ButtonPriceVariant | ButtonVariant | ButtonIconVariant;
    /** Размер кнопки */
    size?: ButtonIconSize | ButtonSize | ButtonPriceSize;
    /** Включение состояния disabled */
    disabled?: boolean;
    /** render-проп, добавляющий колесо загрузки - спиннер
     * необходимо ипортировать функцию Loader и передать в качестве значения
     * waiting={Loader}
     */
    waiting?: (({ buttonVariant, buttonSize }: {
        buttonVariant: ButtonVariant;
        buttonSize: ButtonSize;
    }) => ReactNode) | null;
    /** Тип кнопки  */
    type?: ButtonType;
    /** Включение опции растягивания кнопки на всю ширину */
    fluid?: boolean;
    /** Обработчик события клика */
    onClick?: (event: SyntheticEvent<HTMLButtonElement>) => void;
    /** Обработчик события потери фокуса */
    onBlur?: (event: SyntheticEvent<HTMLButtonElement>) => void;
    /** Обработчик события фокуса */
    onFocus?: (event: SyntheticEvent<HTMLButtonElement>) => void;
    /** Контент кнопки */
    children?: ReactNode;
    /** Вариант цвета фона, на котором используется кнопка */
    contextBackgroundColor?: 'primary' | 'secondary';
    tabIndex?: number;
    className?: string;
    /** A11y: используемая ARIA роль */
    role?: string;
    /** A11y: зачитываемый текст */
    ariaLabel?: string;
    /** A11y: зачитываемое дополнительное описание */
    ariaDescription?: string;
    /** A11y: скрытие элемента от скринридеров */
    ariaHidden?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

declare const BaseButton: React.ForwardRefExoticComponent<{
    variant?: "primary" | "primary-alternative" | "always-white" | "blur" | "secondary" | "ghost" | "negative" | "scroll" | undefined;
    size?: 24 | 32 | 44 | 52 | 72 | undefined;
    disabled?: boolean | undefined;
    waiting?: (({ buttonVariant, buttonSize }: {
        buttonVariant: ButtonVariant;
        buttonSize: ButtonSize;
    }) => React.ReactNode) | null | undefined;
    type?: ButtonType | undefined;
    fluid?: boolean | undefined;
    onClick?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onBlur?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onFocus?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    children?: React.ReactNode;
    contextBackgroundColor?: "primary" | "secondary" | undefined;
    tabIndex?: number | undefined;
    className?: string | undefined;
    role?: string | undefined;
    ariaLabel?: string | undefined;
    ariaDescription?: string | undefined;
    ariaHidden?: boolean | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=base-button.d.ts.map

declare type ButtonIconProps = Omit<BaseButtonProps, 'fluid' | 'waiting' | 'children'> & {
    /** Цвет кнопки */
    variant?: ButtonIconVariant;
    /** Размер кнопки */
    size?: ButtonIconSize;
    /** Иконка */
    children: ReactElement;
    /** Компонент <Counter /> */
    counter?: ReactElement<CounterProps>;
};
declare const ButtonIcon: React.ForwardRefExoticComponent<Omit<BaseButtonProps, "waiting" | "fluid" | "children"> & {
    /** Цвет кнопки */
    variant?: ButtonIconVariant | undefined;
    /** Размер кнопки */
    size?: ButtonIconSize | undefined;
    /** Иконка */
    children: ReactElement;
    /** Компонент <Counter /> */
    counter?: React.ReactElement<CounterProps, string | React.JSXElementConstructor<any>> | undefined;
} & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=button-icon.d.ts.map

declare type ButtonProps = BaseButtonProps & {
    /** Размер кнопки */
    size?: ButtonSize;
    /** Цвет кнопки */
    variant?: ButtonVariant;
    /** Иконка */
    icon?: ReactElement;
    /** Расположение иконки слева или справа от текста */
    iconPosition?: 'left' | 'right';
};
declare const Button: React.ForwardRefExoticComponent<{
    variant?: "primary" | "primary-alternative" | "always-white" | "blur" | "secondary" | "ghost" | "negative" | "scroll" | undefined;
    size?: 24 | 32 | 44 | 52 | 72 | undefined;
    disabled?: boolean | undefined;
    waiting?: (({ buttonVariant, buttonSize }: {
        buttonVariant: ButtonVariant;
        buttonSize: ButtonSize;
    }) => React.ReactNode) | null | undefined;
    type?: ButtonType | undefined;
    fluid?: boolean | undefined;
    onClick?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onBlur?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onFocus?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    children?: React.ReactNode;
    contextBackgroundColor?: "primary" | "secondary" | undefined;
    tabIndex?: number | undefined;
    className?: string | undefined;
    role?: string | undefined;
    ariaLabel?: string | undefined;
    ariaDescription?: string | undefined;
    ariaHidden?: boolean | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Размер кнопки */
    size?: ButtonSize | undefined;
    /** Цвет кнопки */
    variant?: ButtonVariant | undefined;
    /** Иконка */
    icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
    /** Расположение иконки слева или справа от текста */
    iconPosition?: "left" | "right" | undefined;
} & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=button.d.ts.map

declare type ButtonPriceProps = BaseButtonProps & {
    /** Размер кнопки */
    size?: ButtonPriceSize;
    /** Цвет кнопки */
    variant?: ButtonPriceVariant;
    /** Текущая цена */
    priceCurrent: string;
    /** Старая цена */
    priceOld?: string;
    /** Знак валюты */
    currency?: string;
};
declare const ButtonPrice: React.ForwardRefExoticComponent<{
    variant?: "primary" | "primary-alternative" | "always-white" | "blur" | "secondary" | "ghost" | "negative" | "scroll" | undefined;
    size?: 24 | 32 | 44 | 52 | 72 | undefined;
    disabled?: boolean | undefined;
    waiting?: (({ buttonVariant, buttonSize }: {
        buttonVariant: ButtonVariant;
        buttonSize: ButtonSize;
    }) => React.ReactNode) | null | undefined;
    type?: ButtonType | undefined;
    fluid?: boolean | undefined;
    onClick?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onBlur?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    onFocus?: ((event: React.SyntheticEvent<HTMLButtonElement, Event>) => void) | undefined;
    children?: React.ReactNode;
    contextBackgroundColor?: "primary" | "secondary" | undefined;
    tabIndex?: number | undefined;
    className?: string | undefined;
    role?: string | undefined;
    ariaLabel?: string | undefined;
    ariaDescription?: string | undefined;
    ariaHidden?: boolean | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Размер кнопки */
    size?: ButtonPriceSize | undefined;
    /** Цвет кнопки */
    variant?: ButtonPriceVariant | undefined;
    /** Текущая цена */
    priceCurrent: string;
    /** Старая цена */
    priceOld?: string | undefined;
    /** Знак валюты */
    currency?: string | undefined;
} & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=button-price.d.ts.map

declare type LoaderProps = {
    buttonVariant: ButtonVariant;
    buttonSize: ButtonSize;
};
declare const Loader: FC<LoaderProps>;

export { BaseButton, BaseButtonProps, Button, ButtonIcon, ButtonIconProps, ButtonPrice, ButtonPriceProps, ButtonProps, Loader };
