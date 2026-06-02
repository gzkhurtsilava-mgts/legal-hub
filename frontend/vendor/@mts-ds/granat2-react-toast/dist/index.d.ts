/// <reference types="react" />
import * as React from 'react';
import { ReactElement } from 'react';
import { AvatarProps } from '@mts-ds/granat2-react-avatar';

declare type ToastBaseProps = {
    /** Заголовок */
    title?: string;
    /** Описание */
    message: string;
    /** Флаг нужно установить если тост будет отображен в мобильном БП */
    device: 'mobile' | 'desktop';
    className?: string;
};
declare type ToastWithAvatarProps = {
    /** Аватар */
    avatar: ReactElement<AvatarProps>;
    icon?: never;
} & ToastBaseProps;
declare type ToastWithIconProps = {
    /** Иконка. Можно передавать 4 типа иконки ToastInfoIcon, ToastDoneIcon, ToastErrorIcon, ToastWarningIcon */
    icon?: ReactElement;
    avatar?: never;
} & ToastBaseProps;
declare type ToastProps = (ToastWithAvatarProps | ToastWithIconProps) & React.ComponentPropsWithoutRef<'div'>;
/**
 * Компонент Toast
 */
declare const Toast: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLDivElement>>;

declare function DoneIcon(): JSX.Element;

declare function ErrorIcon(): JSX.Element;

declare function WarningIcon(): JSX.Element;

declare function InfoIcon(): JSX.Element;

export { DoneIcon, ErrorIcon, InfoIcon, Toast, ToastProps, WarningIcon };
