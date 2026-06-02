import * as React from 'react';
import { ChangeEventHandler } from 'react';

declare type SwitchSize = 16 | 24 | 32;
declare type BaseSwitchProps = {
    /** Размер компонента */
    size?: SwitchSize;
    /** Признак не активного состояния компонента */
    disabled?: boolean;
    /** Обработчик события изменеия состояния checked */
    onChange?: ChangeEventHandler<HTMLInputElement>;
    /** Имя контрола */
    name?: string;
    /** Значение контрола */
    value?: string;
    /** Идентификатор */
    id?: string;
    /** A11y: зачитываемый текст */
    ariaLabel?: string;
    /** A11y: id элемента с зачитываемым текстом */
    ariaLabelledby?: string;
    /** A11y: id элемента с дополнительным описанием */
    ariaDescribedby?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare type ControlledSwitchProps = {
    /** Состояние контролируемого компонента */
    checked: boolean;
    defaultChecked?: never;
};
declare type UncontrolledSwitchProps = {
    /** Состояние неконролирумого компонента */
    defaultChecked: boolean;
    checked?: never;
};
declare type SwitchProps = (ControlledSwitchProps | UncontrolledSwitchProps) & BaseSwitchProps;
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=switch.d.ts.map

export { Switch, SwitchProps, SwitchSize };
