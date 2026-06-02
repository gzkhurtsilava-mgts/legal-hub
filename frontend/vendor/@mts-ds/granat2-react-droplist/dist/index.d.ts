import * as React from 'react';
import { Key, ComponentPropsWithoutRef, RefObject, ReactElement } from 'react';

declare type Size = 32 | 44 | 52;
declare type CellProps = {
    onClick?: (value: Key) => void;
    text: string;
    caption?: string;
    selected?: boolean;
    key: Key;
} & ComponentPropsWithoutRef<'li'>;
declare type DroplistProps = {
    /** Размер компонента */
    size?: Size;
    /** Элемент-таргет, к которому будет привязан дроплист */
    anchorRef?: RefObject<HTMLElement>;
    /** Раскрытое состояние дроплиста */
    open?: boolean;
    /** Элементы выпадающего списка */
    children: ReactElement<CellProps>[];
    /** Обработчик события выбранных элементов */
    onCellClick?: (cellKey: Key) => void;
} & ComponentPropsWithoutRef<'div'>;

declare const Droplist: React.ForwardRefExoticComponent<{
    size?: Size | undefined;
    anchorRef?: React.RefObject<HTMLElement> | undefined;
    open?: boolean | undefined;
    children: React.ReactElement<CellProps, string | React.JSXElementConstructor<any>>[];
    onCellClick?: ((cellKey: React.Key) => void) | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=droplist.d.ts.map

declare const Cell: React.ForwardRefExoticComponent<{
    onClick?: ((value: React.Key) => void) | undefined;
    text: string;
    caption?: string | undefined;
    selected?: boolean | undefined;
    key: React.Key;
} & Pick<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "key" | keyof React.LiHTMLAttributes<HTMLLIElement>> & React.RefAttributes<HTMLLIElement>>;
//# sourceMappingURL=droplist-cell.d.ts.map

export { Cell, CellProps, Droplist, DroplistProps };
