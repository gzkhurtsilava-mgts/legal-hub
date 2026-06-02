/// <reference types="react" />
import * as React from 'react';
import { ReactElement } from 'react';

declare type View = 'mobile' | 'desktop';
declare type SnackbarProps = {
    /**
     * Текст сообщения
     */
    message: string;
    /**
     * Подпись кнопки
     */
    actionLabel: string;
    /**
     * Таймаут для компонента. Задаётся в мс.
     */
    timeout?: number;
    /**
     * Представление компонента
     */
    view?: View;
    /**
     * Используемая иконка
     *
     * Можно использовать иконки: `<DoneIcon />`, `<ErrorIcon />`, `<InfoIcon />`, `<TimerIcon />`, `<WarningIcon />` идущие вместе с этим компонентом
     */
    icon?: ReactElement | null;
    /**
     * Событие нажатия на кнопку
     */
    onAction?: () => void;
    /**
     * Событие истечения таймаута
     */
    onTimeout?: () => void;
    className?: string;
} & React.ComponentPropsWithoutRef<'div'>;
/**
 * Компонент Snackbar
 */
declare const Snackbar: React.ForwardRefExoticComponent<{
    /**
     * Текст сообщения
     */
    message: string;
    /**
     * Подпись кнопки
     */
    actionLabel: string;
    /**
     * Таймаут для компонента. Задаётся в мс.
     */
    timeout?: number | undefined;
    /**
     * Представление компонента
     */
    view?: View | undefined;
    /**
     * Используемая иконка
     *
     * Можно использовать иконки: `<DoneIcon />`, `<ErrorIcon />`, `<InfoIcon />`, `<TimerIcon />`, `<WarningIcon />` идущие вместе с этим компонентом
     */
    icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>> | null | undefined;
    /**
     * Событие нажатия на кнопку
     */
    onAction?: (() => void) | undefined;
    /**
     * Событие истечения таймаута
     */
    onTimeout?: (() => void) | undefined;
    className?: string | undefined;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React.HTMLAttributes<HTMLDivElement>> & React.RefAttributes<HTMLElement>>;

declare function DoneIcon(): JSX.Element;

declare function ErrorIcon(): JSX.Element;

declare function InfoIcon(): JSX.Element;

declare function WarningIcon(): JSX.Element;

declare function TimerIcon(): JSX.Element;

export { DoneIcon, ErrorIcon, InfoIcon, Snackbar, SnackbarProps, TimerIcon, View, WarningIcon };
