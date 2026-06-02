'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import { Theme } from '@mts-ds/granat2-react-theme';
import { RootContextProvider } from './root-context/root-context-provider.js';

/**
 * Компонент Root
 */
const Root = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    themeName,
    themeRoot = 'body',
    children
  } = props;
  return /*#__PURE__*/React.createElement(RootContextProvider, null, /*#__PURE__*/React.createElement(Theme, {
    themeName: themeName,
    ref: ref,
    themeTarget: themeRoot
  }, children));
});

export { Root as MtsDsRoot, Root };
