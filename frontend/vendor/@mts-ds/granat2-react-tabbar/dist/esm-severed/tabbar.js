import * as React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './tabbar.module.scss.js';
import { ActiveTabProvider } from './context/active-tab.js';

const TabBar = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    transparent = false,
    separator = true,
    activeTab,
    onActiveTabChange,
    className,
    defaultActiveTab,
    ...rest
  } = props;
  const blockStyles = clsx(styles['mtsds-tabbar'], transparent && styles['mtsds-tabbar--transparent'], separator && styles['mtsds-tabbar--separator']);
  return /*#__PURE__*/React.createElement(ActiveTabProvider, {
    activeTab: activeTab,
    defaultActiveTab: defaultActiveTab,
    onActiveTabChange: onActiveTabChange
  }, /*#__PURE__*/React.createElement("menu", {
    ...rest,
    ref: ref,
    className: clsx(blockStyles, className)
  }, children));
});

export { TabBar };
