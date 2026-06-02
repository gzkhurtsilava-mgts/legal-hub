'use client';
import * as React from 'react';
import { forwardRef, useRef, useMemo } from 'react';
import { useIsomorphicLayoutEffect } from '@mts-ds/react-utils';
import { clsx } from './ext/clsx/dist/clsx.m.js';
import { ThemeContext } from './theme-context.js';

const ROOT_CLASSNAME = 'mtsds-vars';
const SELF = 'self';
/**
 * Компонент Theme
 */
const Theme = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    themeName,
    themeTarget = SELF,
    children,
    className,
    ...rest
  } = props;
  const isSelf = themeTarget === SELF;
  const targetRef = useRef(null);
  useIsomorphicLayoutEffect(() => {
    if (isSelf) return () => {};
    try {
      const res = document.querySelector(themeTarget);
      if (!(res instanceof HTMLElement)) throw new Error(`Theme target is not an HTMLElement`);
      targetRef.current = res;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      targetRef.current = null;
      return () => {};
    }
    const el = targetRef.current;
    el.classList.add(ROOT_CLASSNAME);
    return () => {
      el.classList.remove(ROOT_CLASSNAME);
      delete el.dataset.mtsdsTheme;
      targetRef.current = null;
    };
  }, [themeTarget, isSelf]);
  useIsomorphicLayoutEffect(() => {
    if (isSelf) return;
    const el = targetRef.current;
    if (!el) return;
    el.dataset.mtsdsTheme = themeName;
  }, [themeName, isSelf]);
  const value = useMemo(() => ({
    themeName
  }), [themeName]);
  return /*#__PURE__*/React.createElement(ThemeContext.Provider, {
    value: value
  }, /*#__PURE__*/React.createElement("div", {
    ...rest,
    ref: ref,
    className: clsx(className, isSelf && ROOT_CLASSNAME),
    "data-mtsds-theme": isSelf ? themeName : undefined
  }, children));
});

export { Theme as MtsDsTheme, Theme };
