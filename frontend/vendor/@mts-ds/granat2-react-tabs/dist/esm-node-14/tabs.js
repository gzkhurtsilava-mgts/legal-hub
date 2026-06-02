import * as React from 'react';
import { forwardRef } from 'react';
import { IndicatorProvider } from './context/indicator.js';
import { TabsInner } from './items/tabs-inner.js';

const Tabs = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    size = 32,
    type = 'button',
    accent,
    activeTab,
    defaultActiveTab,
    onActiveTabChange,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement(IndicatorProvider, {
    size: size,
    type: type,
    activeTab: activeTab,
    defaultActiveTab: defaultActiveTab,
    onActiveTabChange: onActiveTabChange
  }, /*#__PURE__*/React.createElement(TabsInner, {
    ...rest,
    ref: ref,
    accent: accent
  }, children));
});

export { Tabs };
