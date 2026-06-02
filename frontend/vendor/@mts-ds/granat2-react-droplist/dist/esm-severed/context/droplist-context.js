'use client';
import * as React from 'react';
import { createContext, useMemo } from 'react';

const DroplistContext = /*#__PURE__*/createContext({
  onCellClick: () => {},
  size: 44
});
function DroplistProvider({
  children,
  onCellClick,
  size
}) {
  const value = useMemo(() => ({
    onCellClick,
    size
  }), [onCellClick, size]);
  return /*#__PURE__*/React.createElement(DroplistContext.Provider, {
    value: value
  }, children);
}

export { DroplistContext, DroplistProvider };
