import * as React from 'react';
import { ReactNode, ReactElement } from 'react';
import { Side, Strategy } from '@floating-ui/react';

declare type TooltipProps = {
    /** Текст внутри тултипа */
    text: ReactNode;
    /** Позиционирование тултипа */
    placement?: Side;
    /** Список позиций который тултип будет занимать если не сможет занять позицию по умолчанию
     *  Указывать в порядке приоритета */
    preferPositions?: Array<Side>;
    /** Целевой элмент, к которому будет привязан тултип */
    children: ReactElement;
    /** Свойство аналогичное свойству css, поднимает тултип на указанный слой
     * @default 1
     */
    zIndex?: number;
    /** Свойство аналогичное свойству css, позиционирует тултип
     * @default absolute
     */
    position?: Strategy;
    /** Скрытие тултипа, если целевой элемент пропал из области видимости
     * @default true
     */
    hideTooltip?: boolean;
    /** Событие показа тултипа
     * @default hover
     */
    trigger?: 'hover' | 'focus' | 'click';
    /** Состояние для контролируемого тултипа */
    open?: boolean;
    /** Состояние для неконтролируменого тултипа */
    initialOpen?: boolean;
    /** Функция-обработчик состояния контролируемого тултипа */
    onOpenChange?: (open: boolean) => void;
    className?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare const Tooltip: React.ForwardRefExoticComponent<{
    /** Текст внутри тултипа */
    text: ReactNode;
    /** Позиционирование тултипа */
    placement?: Side | undefined;
    /** Список позиций который тултип будет занимать если не сможет занять позицию по умолчанию
     *  Указывать в порядке приоритета */
    preferPositions?: Side[] | undefined;
    /** Целевой элмент, к которому будет привязан тултип */
    children: ReactElement;
    /** Свойство аналогичное свойству css, поднимает тултип на указанный слой
     * @default 1
     */
    zIndex?: number | undefined;
    /** Свойство аналогичное свойству css, позиционирует тултип
     * @default absolute
     */
    position?: Strategy | undefined;
    /** Скрытие тултипа, если целевой элемент пропал из области видимости
     * @default true
     */
    hideTooltip?: boolean | undefined;
    /** Событие показа тултипа
     * @default hover
     */
    trigger?: "hover" | "focus" | "click" | undefined;
    /** Состояние для контролируемого тултипа */
    open?: boolean | undefined;
    /** Состояние для неконтролируменого тултипа */
    initialOpen?: boolean | undefined;
    /** Функция-обработчик состояния контролируемого тултипа */
    onOpenChange?: ((open: boolean) => void) | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=tooltip.d.ts.map

export { Tooltip, TooltipProps };
