import * as React from 'react';

declare type CounterSize = 16 | 20 | 24;
declare type CounterWithValueProps = {
    /**
     * Значение счётчика
     */
    value: number;
    /** Визуальный размер счетчика */
    size: CounterSize;
    /**
     * Максимальное значение счётчика, после которого отображаемое значение будет равно максимальному и будет показан знак переполнения.
     * Не используется со значением size=notification
     */
    max?: number;
    /**
     * Цветовой вариант счетчика. По умолчанию secondary.
     * Не используется со значением size=notification
     */
    variant?: 'primary' | 'secondary';
    /**
     * Вариант цвета фона, на котором используется счетчик.
     * Не используется со значением size=notification
     */
    contextBackgroundColor?: 'primary' | 'secondary';
    className?: string;
    /** A11y: зачитываемый текст */
    ariaLabel?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare type NotificationProps = {
    /** Визуальный размер счетчика. Используется notification */
    size: 'notification';
    className?: string;
    /** A11y: зачитываемый текст */
    ariaLabel?: string;
} & React.ComponentPropsWithoutRef<'div'>;
declare type CounterProps = CounterWithValueProps | NotificationProps;
/**
 * Компонент Counter
 */
declare const Counter: React.ForwardRefExoticComponent<CounterProps & React.RefAttributes<HTMLDivElement>>;

export { Counter, CounterProps };
