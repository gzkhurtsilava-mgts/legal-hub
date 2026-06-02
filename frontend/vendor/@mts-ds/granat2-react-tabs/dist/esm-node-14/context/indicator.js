'use client';
import * as React from 'react';
import { createContext, useState, useMemo } from 'react';

const defaultValueActiveTab = {
  offset: {
    width: 0,
    left: 0
  },
  setOffset: () => {},
  size: 32,
  type: 'button',
  activeTab: undefined,
  setActiveTab: () => ''
};
const IndicatorContext = /*#__PURE__*/createContext(defaultValueActiveTab);
function IndicatorProvider(props) {
  const {
    children,
    size,
    type,
    activeTab: activeTabFromProps,
    defaultActiveTab,
    onActiveTabChange
  } = props;
  const isControlled = typeof activeTabFromProps !== 'undefined';
  const hasDefaultValue = typeof defaultActiveTab !== 'undefined';
  const [offset, setOffset] = useState({
    width: 0,
    left: 0
  });
  const [internalActive, setInternalActive] = useState(hasDefaultValue ? defaultActiveTab : undefined);
  const value = useMemo(() => ({
    offset,
    setOffset,
    size,
    type,
    activeTab: isControlled ? activeTabFromProps : internalActive,
    setActiveTab: id => {
      if (onActiveTabChange) {
        onActiveTabChange(id);
      }
      if (!isControlled) {
        setInternalActive(id);
      }
    }
  }), [offset, size, type, internalActive, onActiveTabChange, isControlled, activeTabFromProps]);
  return /*#__PURE__*/React.createElement(IndicatorContext.Provider, {
    value: value
  }, children);
}

export { IndicatorContext, IndicatorProvider };
