/// <reference types="react" />
import * as React from 'react';
import { ReactNode } from 'react';

declare const THEMES: readonly ["light", "dark"];
declare type ThemeName = typeof THEMES[number];
declare type ThemeContextType = {
    themeName: ThemeName;
};
declare const ThemeContext: React.Context<ThemeContextType | undefined>;

interface ThemeProps extends React.ComponentPropsWithoutRef<'div'> {
    /** Название текущей цветовой схемы */
    themeName: ThemeName;
    /**
     * Элемент, который будет корнем для темизации.
     *
     * Значением может быть ключевое слово `self` либо css-селектор.
     * `self` указывает на то, что корнем будет сам компонент темы.
     *
     * @default self
     */
    themeTarget?: string;
    children?: ReactNode;
}
/**
 * Компонент Theme
 */
declare const Theme: React.ForwardRefExoticComponent<ThemeProps & React.RefAttributes<HTMLDivElement>>;

declare function useTheme(): ThemeContextType;

export { Theme as MtsDsTheme, Theme, ThemeContext, ThemeContextType, ThemeName, ThemeProps, useTheme };
