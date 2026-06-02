import * as React from 'react';
import { ChangeEvent, ComponentPropsWithoutRef } from 'react';

declare type CheckboxChangeEvent = (e: ChangeEvent<HTMLInputElement> & {
    indeterminate?: boolean;
}) => void;
interface BaseCheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'checked' | 'onChange'> {
    /** Размер компонента */
    size?: 16 | 24 | 32;
    /** Обработчик события изменения состояния checked */
    onChange?: CheckboxChangeEvent;
    /** Состояние ошибки */
    invalid?: boolean;
    /** Признак неактивного состояния компонента */
    disabled?: boolean;
}
declare type ControlledCheckboxProps = {
    /** Управление состоянием (checked/unchecked/indeterminate) контролируемого компонента.
     * Для установки состояния indeterminate необходимо передать checked={null}
     */
    checked?: boolean | null;
    defaultChecked?: never;
    useIndeterminate?: never;
    nativeIndeterminateValue?: never;
};
declare type UncontrolledCheckboxProps = {
    /** Управление состоянием (checked/unchecked/indeterminate) неконтролируемого компонента.
     * Для установки состояния indeterminate необходимо передать defaultChecked={null}
     */
    defaultChecked?: boolean | null;
    checked?: never;
    /** Включает возможность циклической установки состояния indeterminate
     * (состояние следующее за unchecked) неконтролируемого компонента
     */
    useIndeterminate?: boolean;
    /** Значение нативного атрибута checked чекбокса для неопределенного состояния компонента */
    nativeIndeterminateValue?: boolean;
};
declare type CheckboxProps = (ControlledCheckboxProps | UncontrolledCheckboxProps) & BaseCheckboxProps;
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=checkbox.d.ts.map

export { Checkbox, CheckboxChangeEvent, CheckboxProps };
