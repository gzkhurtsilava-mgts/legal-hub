'use client';
import * as React from 'react';
import { createContext, useState, useMemo } from 'react';

const defaultValueActiveTab = {
  activeTab: undefined,
  setActiveTab: () => {}
};
const ActiveTabContext = /*#__PURE__*/createContext(defaultValueActiveTab);
function ActiveTabProvider({
  children,
  activeTab: activeTabFromProps,
  defaultActiveTab,
  onActiveTabChange
}) {
  const isControlled = typeof activeTabFromProps !== 'undefined';
  const hasDefaultValue = typeof defaultActiveTab !== 'undefined';
  const [internalActive, setInternalActive] = useState(hasDefaultValue ? defaultActiveTab : undefined);
  const value = useMemo(() => ({
    activeTab: isControlled ? activeTabFromProps : internalActive,
    setActiveTab: id => {
      if (onActiveTabChange) {
        onActiveTabChange(id);
      }
      if (!isControlled) {
        setInternalActive(id);
      }
    }
  }), [internalActive, onActiveTabChange, isControlled, activeTabFromProps]);
  return /*#__PURE__*/React.createElement(ActiveTabContext.Provider, {
    value: value
  }, children);
}

export { ActiveTabContext, ActiveTabProvider };
