import * as React from 'react';
import { ReactElement } from 'react';
import { AvatarProps } from '@mts-ds/granat2-react-avatar';
import { CounterProps } from '@mts-ds/granat2-react-counter';

declare type TabProps = {
    /** Текст таба  */
    label?: string;
    /** Иконка таба  */
    icon?: ReactElement;
    /** Компонент аватара  */
    avatar?: ReactElement<AvatarProps>;
    /**  Компонент каунтера, если необходимо */
    counter?: ReactElement<CounterProps>;
    /** Ссылка для перехода */
    link?: string;
    /** Уникальный идентификатор таба */
    id: string;
    /** Обработчик события клика */
    onClick?: () => void;
    className?: string;
} & React.ComponentPropsWithoutRef<'li'>;
declare const Tab: React.ForwardRefExoticComponent<{
    /** Текст таба  */
    label?: string | undefined;
    /** Иконка таба  */
    icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
    /** Компонент аватара  */
    avatar?: React.ReactElement<AvatarProps, string | React.JSXElementConstructor<any>> | undefined;
    /**  Компонент каунтера, если необходимо */
    counter?: React.ReactElement<CounterProps, string | React.JSXElementConstructor<any>> | undefined;
    /** Ссылка для перехода */
    link?: string | undefined;
    /** Уникальный идентификатор таба */
    id: string;
    /** Обработчик события клика */
    onClick?: (() => void) | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;

declare type BaseTabbarProps = {
    /** Табы внутри таббара */
    children: ReactElement<TabProps>[];
    /** Флаг для установки прозрачного фона таббара */
    transparent?: boolean;
    /** Флаг для управления верхним разделителем. По умолчанию разделитель включен, но можно отключить. */
    separator?: boolean;
    onActiveTabChange?: (id: string | undefined) => void;
    className?: string;
} & React.ComponentPropsWithoutRef<'menu'>;
declare type UncontrolledTabbarProps = {
    /** Состояние неконтролируемого компонента */
    defaultActiveTab?: string | undefined;
    activeTab?: never;
};
declare type ControlledTabbarProps = {
    /** Состояние контролируемого компонента */
    activeTab?: string | undefined;
    defaultActiveTab?: never;
};
declare type TabBarProps = (ControlledTabbarProps | UncontrolledTabbarProps) & BaseTabbarProps;
declare const TabBar: React.ForwardRefExoticComponent<TabBarProps & React.RefAttributes<HTMLMenuElement>>;

export { Tab, TabBar, TabBarProps, TabProps };
