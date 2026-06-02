'use client';
import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import cn from 'clsx';
import styles from './snackbar.module.scss.js';
import { TimeoutProvider } from './context.js';

/**
 * Компонент Snackbar
 */
const Snackbar = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    message,
    actionLabel,
    timeout: rawTimeout = 5000,
    icon = null,
    view = 'desktop',
    onAction,
    onTimeout,
    className,
    ...rest
  } = props;
  const timeout = Math.max(3000, Math.min(15_000, rawTimeout));
  useEffect(() => {
    const id = setTimeout(() => {
      if (onTimeout) onTimeout();
    }, timeout);
    return () => {
      clearTimeout(id);
    };
  }, [timeout, onTimeout]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      className: cn(className, styles['mtsds-snackbar'], view && styles[`mtsds-snackbar--device--${view}`]),
      ref: ref
    }, /*#__PURE__*/React.createElement("p", {
      className: cn(styles['mtsds-snackbar__description'])
    }, message), /*#__PURE__*/React.createElement(TimeoutProvider, {
      timeout: timeout
    }, /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-snackbar__icon'])
    }, icon)), /*#__PURE__*/React.createElement("button", {
      className: cn(styles['mtsds-snackbar__button']),
      type: "button",
      onClick: onAction
    }, actionLabel))
  );
});

export { Snackbar };
