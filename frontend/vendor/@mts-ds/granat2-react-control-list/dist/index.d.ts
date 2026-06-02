import * as React from 'react';
import { ReactElement, ComponentPropsWithoutRef } from 'react';
import { CheckboxProps } from '@mts-ds/granat2-react-checkbox';
import { RadioProps } from '@mts-ds/granat2-react-radio';

declare type ControlCellProps = {
    children: ReactElement<RadioProps | CheckboxProps>;
    disabled?: boolean;
    label: string;
    description?: string;
    invalid?: boolean;
} & ComponentPropsWithoutRef<'label'>;
declare const ControlCell: React.ForwardRefExoticComponent<{
    children: ReactElement<RadioProps | CheckboxProps>;
    disabled?: boolean | undefined;
    label: string;
    description?: string | undefined;
    invalid?: boolean | undefined;
} & Pick<React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, "key" | keyof React.LabelHTMLAttributes<HTMLLabelElement>> & React.RefAttributes<HTMLLabelElement>>;
//# sourceMappingURL=control-cell.d.ts.map

declare type CheckboxCellProps = {
    /** Заголовок */
    label: string;
    /** Описание */
    description?: string;
    /** Неактивное состояние */
    disabled?: boolean;
    /** Состояние ошибки */
    invalid?: boolean;
    /** Пропсы Checkbox, ControlCell */
    components?: {
        checkbox?: CheckboxProps;
        controlCell?: ControlCellProps;
    };
    /** Элементы типа ControlList для добавления уровня вложенности */
    children?: ReactElement<ControlListProps>;
} & ComponentPropsWithoutRef<'li'>;
declare const CheckboxCell: React.ForwardRefExoticComponent<{
    /** Заголовок */
    label: string;
    /** Описание */
    description?: string | undefined;
    /** Неактивное состояние */
    disabled?: boolean | undefined;
    /** Состояние ошибки */
    invalid?: boolean | undefined;
    /** Пропсы Checkbox, ControlCell */
    components?: {
        checkbox?: CheckboxProps | undefined;
        controlCell?: ControlCellProps | undefined;
    } | undefined;
    /** Элементы типа ControlList для добавления уровня вложенности */
    children?: React.ReactElement<ControlListProps, string | React.JSXElementConstructor<any>> | undefined;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;
//# sourceMappingURL=checkbox-cell.d.ts.map

declare type RadioCellProps = {
    /** Заголовок */
    label: string;
    /** Описание */
    description?: string;
    /** Неактивное состояние */
    disabled?: boolean;
    /** Состояние ошибки */
    invalid?: boolean;
    /** Пропсы Radio, ControlCell */
    components?: {
        radio?: RadioProps;
        controlCell?: ControlCellProps;
    };
    /** Элементы типа ControlList для добавления уровня вложенности */
    children?: ReactElement<ControlListProps>;
} & ComponentPropsWithoutRef<'li'>;
declare const RadioCell: React.ForwardRefExoticComponent<{
    /** Заголовок */
    label: string;
    /** Описание */
    description?: string | undefined;
    /** Неактивное состояние */
    disabled?: boolean | undefined;
    /** Состояние ошибки */
    invalid?: boolean | undefined;
    /** Пропсы Radio, ControlCell */
    components?: {
        radio?: RadioProps | undefined;
        controlCell?: ControlCellProps | undefined;
    } | undefined;
    /** Элементы типа ControlList для добавления уровня вложенности */
    children?: React.ReactElement<ControlListProps, string | React.JSXElementConstructor<any>> | undefined;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;
//# sourceMappingURL=radio-cell.d.ts.map

declare type ControlListSize = 's' | 'm' | 'l';
interface ControlListProps extends ComponentPropsWithoutRef<'ul'> {
    /** Элементы типа CheckboxCellProps | RadioCellProps */
    children: ReactElement<CheckboxCellProps | RadioCellProps> | ReactElement<CheckboxCellProps | RadioCellProps>[];
    /** Размер компонента */
    size?: ControlListSize;
    /** Значение true устанавливает контролы Radio и Checkbox по центру */
    middle?: boolean;
    /** Устанавливает разделитель между элементами списка */
    separator?: boolean;
}
declare const ControlList: React.ForwardRefExoticComponent<ControlListProps & React.RefAttributes<HTMLUListElement>>;
//# sourceMappingURL=control-list.d.ts.map

export { CheckboxCell, CheckboxCellProps, ControlCell, ControlCellProps, ControlList, ControlListProps, ControlListSize, RadioCell, RadioCellProps };
