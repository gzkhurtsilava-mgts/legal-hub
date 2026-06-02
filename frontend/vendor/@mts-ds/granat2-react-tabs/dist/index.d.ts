import * as React from 'react';
import { ReactElement, ComponentPropsWithoutRef } from 'react';
import { MtsDsCounterProps } from '@mts-ds/granat-react-counter';
import * as _mts_ds_granat_react_counter_severed from '@mts-ds/granat-react-counter/severed';

declare type TabProps = {
    /** Уникальный идентификатор таба */
    id: string;
    /** Текст таба */
    text: string;
    /** Включение стрелки */
    withArrow?: boolean;
    /** Обработчик клика */
    onClick?: () => void;
    /** <Counter/> */
    children?: ReactElement<MtsDsCounterProps>;
    className?: string;
} & ComponentPropsWithoutRef<'li'>;
declare type BaseTabsProps = {
    /** Контент Tab[] */
    children: ReactElement<TabProps>[];
    /** Размер */
    size: 32 | 52 | 72;
    /** Тип таба */
    type: 'button' | 'stroke';
    /** Выделение табов */
    accent?: boolean;
    /** Обработчик события смены активного таба */
    onActiveTabChange?: (id: string | undefined) => void;
    className?: string;
    style?: React.CSSProperties;
} & ComponentPropsWithoutRef<'ul'>;
declare type UncontrolledTabsProps = {
    /** Дефолтное значение активного таба для неконтролируемых табов */
    defaultActiveTab?: string | undefined;
    activeTab?: never;
};
declare type ControlledTabsProps = {
    /** Значение активного таба для контролируемых табов */
    activeTab?: string | undefined;
    defaultActiveTab?: never;
};
declare type TabsProps = (ControlledTabsProps | UncontrolledTabsProps) & BaseTabsProps;

declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLUListElement>>;

declare const Tab: React.ForwardRefExoticComponent<{
    id: string;
    text: string;
    withArrow?: boolean | undefined;
    onClick?: (() => void) | undefined;
    children?: React.ReactElement<_mts_ds_granat_react_counter_severed.MtsDsCounterProps, string | React.JSXElementConstructor<any>> | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;

export { BaseTabsProps, Tab, TabProps, Tabs, TabsProps };
