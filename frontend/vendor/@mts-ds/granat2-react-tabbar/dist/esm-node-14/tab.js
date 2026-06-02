'use client';
import * as React from 'react';
import { forwardRef, useContext, useMemo } from 'react';
import clsx from 'clsx';
import styles from './tabbar.module.scss.js';
import { ActiveTabContext } from './context/active-tab.js';

function handleSvgStyles(icon) {
  const blockClass = clsx(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.cloneElement(icon, {
    className: clsx(blockClass)
  });
}
const Tab = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    onClick,
    id,
    label,
    link,
    icon,
    avatar,
    counter,
    className,
    ...rest
  } = props;
  const {
    activeTab,
    setActiveTab
  } = useContext(ActiveTabContext);
  const handlerOnClick = () => {
    setActiveTab(id);
    if (onClick) onClick();
  };
  const preparedAvatar = useMemo(() => {
    let avatarWithSize;
    if (avatar) {
      avatarWithSize = /*#__PURE__*/React.cloneElement(avatar, {
        size: 24
      });
    }
    return avatarWithSize;
  }, [avatar]);
  const blockStyles = clsx(styles['mtsds-tabbar__tab'], counter && [styles['mtsds-tabbar__tab--has-counter'], counter.props.size === 'notification' && styles['mtsds-tabbar__tab--has-notification']], activeTab === id && styles['mtsds-tabbar__tab--active']);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,react/jsx-props-no-spreading,jsx-a11y/no-noninteractive-element-interactions
    React.createElement("li", {
      ...rest,
      ref: ref,
      className: clsx(blockStyles, className),
      onClick: handlerOnClick
    }, /*#__PURE__*/React.createElement("a", {
      className: clsx(styles['mtsds-tabbar__tab-link']),
      href: link
    }, label), !preparedAvatar && icon && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabbar__tab-icon']
    }, handleSvgStyles(icon)), preparedAvatar && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabbar__tab-avatar']
    }, preparedAvatar), counter && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabbar__tab-counter']
    }, counter))
  );
});

export { Tab };
