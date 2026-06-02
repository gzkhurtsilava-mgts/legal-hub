import * as React from 'react';
import { ComponentPropsWithoutRef, ChangeEventHandler, ReactElement } from 'react';

interface ItemProps extends Omit<ComponentPropsWithoutRef<'label'>, 'onChange'> {
    /** Имя контрола */
    name?: string;
    /** id контрола */
    id?: string;
    /** Обработчик переключения активного состояния */
    onChange?: ChangeEventHandler<HTMLInputElement>;
    /** Активный контрол */
    active?: boolean;
    /** Текст элемента */
    children?: string;
    /** Иконка */
    icon?: ReactElement;
    /** Неактивное состояние контрола */
    disabled?: boolean;
}
interface SegmentedControlProps extends ComponentPropsWithoutRef<'div'> {
    /** Размер компонента */
    size?: 32 | 44;
    /** Растягивание компонента на всю ширину */
    fluid?: boolean;
    /** Вариант бэкграунда, на котором используется компонент */
    background?: 'primary' | 'secondary';
    /** Гарнитура шрифта */
    typography?: 'bold' | 'regular';
    /** Элементы типа Item */
    children: ReactElement<ItemProps>[];
}

declare const SegmentedControl: React.ForwardRefExoticComponent<SegmentedControlProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=segmented-control.d.ts.map

declare const Item: React.ForwardRefExoticComponent<ItemProps & React.RefAttributes<HTMLLabelElement>>;
//# sourceMappingURL=segmented-control-item.d.ts.map

export { Item, ItemProps, SegmentedControl, SegmentedControlProps };
