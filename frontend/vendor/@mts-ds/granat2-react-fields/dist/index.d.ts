import * as React from 'react';
import { ComponentPropsWithoutRef, SyntheticEvent, RefObject, Ref, ReactElement } from 'react';
import { ButtonIconProps } from '@mts-ds/granat2-react-button';

declare type LabelSize = 's' | 'm' | 'l' | 'xl';
declare type LabelProps = {
    /**
     * Размер лейбла
     */
    size?: LabelSize;
    /**
     * Вспомогательный текст с пояснением назначения поля
     * Отображается во всплывающей подсказке (Tooltip)
     */
    hint?: React.ReactNode;
    /**
     * Делает лейбл неактивным
     * Используется для полей, которые нельзя редактировать
     */
    disabled?: boolean;
    /**
     * Отображает состояние ошибки
     * Применяется, когда связанное поле содержит невалидное значение
     */
    invalid?: boolean;
    /**
     * Добавляются стили для xl при использовании внутри <Field />
     */
    floating?: boolean;
    /**
     * Указывает, является ли поле обязательным
     *
     * - `true` — поле обязательное (скрывается отображение бейджа `Необязательно`)
     * - `false` — поле не обязательное (отображается бейдж `Необязательно`)
     * - `'asterisk'` — обязательное поле с отображением `*`
     */
    required?: boolean | 'asterisk';
    /**
     * Контекст фона, на котором используется лейбл
     * Влияет на цвет бейджа `Необязательно`
     */
    contextBackgroundColor?: 'primary' | 'secondary';
} & ComponentPropsWithoutRef<'label'>;//# sourceMappingURL=label.d.ts.map

declare type DescriptionProps = {
    /**
     * Отображает состояние ошибки.
     * Применяется, когда связанное поле содержит невалидное значение.
     */
    invalid?: boolean;
} & ComponentPropsWithoutRef<'span'>;//# sourceMappingURL=description.d.ts.map

declare type FieldSize = 's' | 'm' | 'l' | 'xl';
declare type FieldState = 'invalid' | 'valid';
declare type OnEventRefCallbackProps<ElementEvent extends HTMLElement = HTMLElement, ElementRef extends HTMLElement = HTMLElement> = {
    event: SyntheticEvent<ElementEvent>;
    ref: RefObject<ElementRef>;
};

declare type ComponentProps$7 = {
    /**
     * Размер поля для ввода
     */
    size?: FieldSize;
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState;
    /**
     * Вариант цвета фона, на котором используется кнопка
     */
    contextBackgroundColor?: 'primary' | 'secondary';
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: string;
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: React.ReactNode;
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: React.ReactNode;
    /**
     * Контент, отображаемый после введенного значение в поле ввода
     * Например, символ валюты или единица измерения
     */
    postfix?: React.ReactNode;
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ({ event, ref }: OnEventRefCallbackProps<HTMLButtonElement, HTMLInputElement>) => void;
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ({ event, ref }: OnEventRefCallbackProps<HTMLButtonElement, HTMLInputElement>) => void;
    /**
     * Ref на корневой DOM-элемент компонента
     */
    rootRef?: RefObject<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'size'>;
declare const componentWithRef$a: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: FieldSize | undefined;
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState | undefined;
    /**
     * Вариант цвета фона, на котором используется кнопка
     */
    contextBackgroundColor?: "primary" | "secondary" | undefined;
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: string | undefined;
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: React.ReactNode;
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: React.ReactNode;
    /**
     * Контент, отображаемый после введенного значение в поле ввода
     * Например, символ валюты или единица измерения
     */
    postfix?: React.ReactNode;
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: (({ event, ref }: OnEventRefCallbackProps<HTMLButtonElement, HTMLInputElement>) => void) | undefined;
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: (({ event, ref }: OnEventRefCallbackProps<HTMLButtonElement, HTMLInputElement>) => void) | undefined;
    /**
     * Ref на корневой DOM-элемент компонента
     */
    rootRef?: RefObject<HTMLDivElement> | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "size"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-base.d.ts.map

declare type ComponentProps$6 = {
    /**
     * Размер поля для ввода
     */
    size?: Exclude<FieldSize, 'xl'>;
} & Omit<ComponentProps$7, 'size'>;
declare const componentWithRef$9: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: "s" | "m" | "l" | undefined;
} & Omit<ComponentProps$7, "size"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-search-field.d.ts.map

declare type ComponentProps$5 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода.
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'size'>;
declare const componentWithRef$8: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода.
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "children" | "size"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-field.d.ts.map

declare type ComponentProps$4 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'size'>;
declare const componentWithRef$7: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "children" | "size"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-password-field.d.ts.map

declare type ComponentProps$3 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Контент, отображаемый после введенного значение в поле ввода
     * Например, символ валюты или единица измерения
     */
    postfix?: ComponentProps$7['postfix'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Ref на корневой DOM-элемент компонента
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'size' | 'type' | 'placeholder'>;
declare const componentWithRef$6: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Контент, отображаемый после введенного значение в поле ввода
     * Например, символ валюты или единица измерения
     */
    postfix?: ComponentProps$7['postfix'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Ref на корневой DOM-элемент компонента
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "placeholder" | "children" | "size" | "type"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-money-field.d.ts.map

declare type ComponentProps$2 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Обработчик нажатия на кнопку даты
     */
    onButtonCalendar?: ButtonIconProps['onClick'];
    /**
     * Ref ссылка на кнопку даты
     */
    calendarRef?: Ref<HTMLButtonElement>;
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'size' | 'type'>;
declare const componentWithRef$5: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Обработчик нажатия на кнопку даты
     */
    onButtonCalendar?: ButtonIconProps['onClick'];
    /**
     * Ref ссылка на кнопку даты
     */
    calendarRef?: Ref<HTMLButtonElement> | undefined;
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "children" | "size" | "type"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-calendar-field.d.ts.map

declare type ComponentProps$1 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Обработчик нажатия на кнопку часов
     */
    onButtonTime?: ButtonIconProps['onClick'];
    /**
     * Ref ссылка на кнопку часов
     */
    timeRef?: Ref<HTMLButtonElement>;
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'input'>, 'children' | 'size' | 'type'>;
declare const componentWithRef$4: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: Props['state'];
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Скрывает иконку состояния валидации
     */
    hideValidationIcon?: boolean | undefined;
    /**
     * Скрывает кнопку очистки значения поля
     */
    hideClearIcon?: boolean | undefined;
    /**
     * Скрывает кнопку копирования значения поля
     */
    hideCopyIcon?: boolean | undefined;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: Props['disabledReason'];
    /**
     * Контент, отображаемый в начале поля ввода
     * В основном используется для иконки
     */
    slotStart?: ComponentProps$7['slotStart'];
    /**
     * Контент, отображаемый в конце поля ввода
     * Например, иконка, кнопка или суффикс
     */
    slotEnd?: ComponentProps$7['slotEnd'];
    /**
     * Обработчик нажатия на кнопку очистки значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonClear?: ComponentProps$7['onButtonClear'];
    /**
     * Обработчик нажатия на кнопку копирования значения
     * Возвращает событие клика и ref на input-элемент
     */
    onButtonCopy?: ComponentProps$7['onButtonCopy'];
    /**
     * Обработчик нажатия на кнопку часов
     */
    onButtonTime?: ButtonIconProps['onClick'];
    /**
     * Ref ссылка на кнопку часов
     */
    timeRef?: Ref<HTMLButtonElement> | undefined;
    /**
     * Ref на корневой DOM-элемент компонента.
     */
    rootRef?: ComponentProps$7['rootRef'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React.InputHTMLAttributes<HTMLInputElement>>, "children" | "size" | "type"> & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=input-time-field.d.ts.map

declare type TextareaResize = 'fixed' | 'manual' | 'auto';
declare type ComponentProps = {
    /**
     * Размер поля для ввода
     */
    size?: FieldSize;
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState;
    /**
     * Вариант цвета фона, на котором используется кнопка
     */
    contextBackgroundColor?: 'primary' | 'secondary';
    /**
     * Разрешает или запрещает менять размер textarea
     * - `fixed` — поле фиксированного размера
     * - `manual` — поле можно растянуть по оси Y
     * - `auto` — поле автоматически увеличивается, при переполнении
     *
     * @default auto
     */
    resize?: TextareaResize;
} & ComponentPropsWithoutRef<'textarea'>;
declare const componentWithRef$3: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: FieldSize | undefined;
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState | undefined;
    /**
     * Вариант цвета фона, на котором используется кнопка
     */
    contextBackgroundColor?: "primary" | "secondary" | undefined;
    /**
     * Разрешает или запрещает менять размер textarea
     * - `fixed` — поле фиксированного размера
     * - `manual` — поле можно растянуть по оси Y
     * - `auto` — поле автоматически увеличивается, при переполнении
     *
     * @default auto
     */
    resize?: TextareaResize | undefined;
} & Pick<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "key" | keyof React.TextareaHTMLAttributes<HTMLTextAreaElement>> & React.RefAttributes<HTMLTextAreaElement>>;
//# sourceMappingURL=textarea.d.ts.map

declare type Props$2 = {
    /**
     * Текущий счетчик символов
     *
     * - Если передать число — оно отобразится
     * - Если передать строку — подсчитается количество символов в строке
     */
    count: number | string;
    /**
     * Максимаьное значение для счетчика символов
     */
    maxCount: number;
} & ComponentPropsWithoutRef<'span'>;
declare const componentWithRef$2: React.ForwardRefExoticComponent<{
    /**
     * Текущий счетчик символов
     *
     * - Если передать число — оно отобразится
     * - Если передать строку — подсчитается количество символов в строке
     */
    count: number | string;
    /**
     * Максимаьное значение для счетчика символов
     */
    maxCount: number;
} & Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "key" | keyof React.HTMLAttributes<HTMLSpanElement>> & React.RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=textarea-counter.d.ts.map

declare type Props$1 = {
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState;
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Разрешает или запрещает менять размер textarea
     * - `fixed` — поле фиксированного размера
     * - `manual` — поле можно растянуть по оси Y
     * - `auto` — поле автоматически увеличивается, при переполнении
     *
     * @default auto
     */
    resize?: ComponentProps['resize'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
        field?: Props;
    };
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'children'>;
declare const componentWithRef$1: React.ForwardRefExoticComponent<{
    /**
     * Размер поля для ввода
     */
    size?: Props['size'];
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState | undefined;
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: Props['hint'];
    /**
     * Лейбл для поля
     */
    label?: Props['label'];
    /**
     * Описание для поля
     */
    description?: Props['description'];
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: Props['error'];
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: Props['contextBackgroundColor'];
    /**
     * Разрешает или запрещает менять размер textarea
     * - `fixed` — поле фиксированного размера
     * - `manual` — поле можно растянуть по оси Y
     * - `auto` — поле автоматически увеличивается, при переполнении
     *
     * @default auto
     */
    resize?: ComponentProps['resize'];
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps | undefined;
        description?: DescriptionProps | undefined;
        field?: Props | undefined;
    } | undefined;
} & Omit<Pick<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "key" | keyof React.TextareaHTMLAttributes<HTMLTextAreaElement>>, "children"> & React.RefAttributes<HTMLTextAreaElement>>;
//# sourceMappingURL=textarea-field.d.ts.map

declare type Props = {
    /**
     * Браузерный атрибут id
     */
    id?: string;
    /**
     * Браузерный атрибут name
     */
    name?: string;
    /**
     * Передача class для компонента обертки
     */
    className?: string;
    /**
     * Браузерный атрибут required
     */
    required?: boolean;
    /**
     * Браузерный атрибут disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Отображение причины блокировки поля
     * Не отображается, при disabled = false
     */
    disabledReason?: string;
    /**
     * Отображает состояние ошибки, применяется, когда поле содержит невалидное значение
     * - `true` — поле подсветится как невалидное и Description станет invalid
     * - `false` — поле не будет подсвечиваться как невалидное и Description станет invalid
     * - `string` — поле подсветится как невалидное и в Description передастся текст ошибки
     */
    error?: string | boolean;
    /**
     * Размер поля для ввода
     */
    size?: FieldSize;
    /**
     * Отображает состояние ошибки, валидного поля или по умолчанию
     * Применяется, чтобы отобразить, что поле невалидное, валидное или по умолчанию
     */
    state?: FieldState;
    /**
     * Отображение подсказки для поля в значке "?"
     */
    hint?: React.ReactNode;
    /**
     * Лейбл для поля
     */
    label?: React.ReactNode;
    /**
     * Описание для поля
     */
    description?: React.ReactNode;
    /**
     * Внутренний элемент Input или Textarea
     */
    children: ReactElement<ComponentProps$7> | ReactElement<ComponentProps>;
    /**
     * Контекст фона, на котором используется поле
     */
    contextBackgroundColor?: 'primary' | 'secondary';
    /**
     * Переопределение пропсов для label и description
     */
    slotProps?: {
        label?: LabelProps;
        description?: DescriptionProps;
    };
};
declare const componentWithRef: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=field.d.ts.map

export { componentWithRef as Field, Props as FieldProps, componentWithRef$a as InputBase, ComponentProps$7 as InputBaseProps, componentWithRef$5 as InputCalendarField, ComponentProps$2 as InputCalendarFieldProps, componentWithRef$8 as InputField, ComponentProps$5 as InputFieldProps, componentWithRef$6 as InputMoneyField, ComponentProps$3 as InputMoneyFieldProps, componentWithRef$7 as InputPasswordField, ComponentProps$4 as InputPasswordFieldProps, componentWithRef$9 as InputSearchField, ComponentProps$6 as InputSearchFieldProps, componentWithRef$4 as InputTimeField, ComponentProps$1 as InputTimeFieldProps, componentWithRef$3 as Textarea, componentWithRef$2 as TextareaCounter, Props$2 as TextareaCounterProps, componentWithRef$1 as TextareaField, Props$1 as TextareaFieldProps, ComponentProps as TextareaProps };
