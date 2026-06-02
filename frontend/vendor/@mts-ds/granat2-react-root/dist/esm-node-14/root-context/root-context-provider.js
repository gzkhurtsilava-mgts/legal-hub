'use client';
import * as React from 'react';
import { useMemo } from 'react';
import { RootContext } from './root-context.js';

/**
 * @internal
 */
const RootContextProvider = function RootContextProvider(props) {
  const {
    children
  } = props;
  const value = useMemo(() => ({}), []);
  return /*#__PURE__*/React.createElement(RootContext.Provider, {
    value: value
  }, children);
};

export { RootContextProvider };
