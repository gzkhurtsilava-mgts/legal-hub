import * as React from 'react';

declare type BaseSpoilerProps = {
    /** Цветовой тип спойлера */
    variant?: 'primary' | 'secondary' | 'white' | 'black';
    /** Состояние disabled  */
    disabled?: boolean;
    /** Текст кнопки спойлера */
    label: string;
    /** Контент спойлера */
    children: React.ReactNode;
    /** Дополнительное действие по клику */
    onToggle?: () => void;
} & React.ComponentPropsWithoutRef<'div'>;
declare type ControlledSpoilerProps = {
    /** Состояние контролируемого компонента */
    active: boolean;
    defaultActive?: never;
};
declare type UncontrolledSpoilerProps = {
    /** Состояние неконтролируемого компонента */
    defaultActive: boolean;
    active?: never;
};
declare type SpoilerProps = (ControlledSpoilerProps | UncontrolledSpoilerProps) & BaseSpoilerProps;
declare const Spoiler: React.ForwardRefExoticComponent<SpoilerProps & React.RefAttributes<HTMLDivElement>>;

export { Spoiler, SpoilerProps };
