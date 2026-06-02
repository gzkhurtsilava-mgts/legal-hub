/// <reference types="react" />
import * as React from 'react';
import { ReactNode } from 'react';
import { ThemeName, ThemeProps } from '@mts-ds/granat2-react-theme';

declare type RootProps = {
    /**
     * Название текущей цветовой схемы
     */
    themeName: ThemeName;
    /**
     * Корневой элемент для темизации.
     *
     * В некоторых случаях физическое расположение DOM-элементов компонентов может быть за пределами компонента Root.
     * Например, при использовании порталов в корне страницы.
     * Для таких случаев, что бы темизация была доступна для таких элементов, корень темизации должен находится в глобальной области.
     *
     * Возможные значения смотрите в свойстве `themeTarget` компонента Theme.
     * По умолчанию: 'body'.
     *
     * @default body
     */
    themeRoot?: ThemeProps['themeTarget'];
    children?: ReactNode;
};
/**
 * Компонент Root
 */
declare const Root: React.ForwardRefExoticComponent<RootProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=root.d.ts.map

declare type RootContextType = Record<string, never>;

/**
 * @internal
 */
declare function useRootContext(): RootContextType;

export { Root as MtsDsRoot, Root, RootContextType, RootProps, useRootContext };
