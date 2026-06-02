'use client';
import * as React from 'react';
import { createContext, useState, useMemo } from 'react';

const defaultValueActiveControl = {
  offset: {
    width: 0,
    left: 0
  },
  setOffset: () => {},
  size: 44
};
const SegmentedControlContext = /*#__PURE__*/createContext(defaultValueActiveControl);
function SegmentedControlProvider({
  children,
  size
}) {
  const [offset, setOffset] = useState({
    width: 0,
    left: 0
  });
  const value = useMemo(() => ({
    offset,
    setOffset,
    size
  }), [offset, size]);
  return /*#__PURE__*/React.createElement(SegmentedControlContext.Provider, {
    value: value
  }, children);
}

export { SegmentedControlContext, SegmentedControlProvider };
