'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './counter.module.scss.js';

const Notification = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size,
    ariaLabel,
    className,
    ...rest
  } = props;
  const blockStyles = cn(styles['mtsds-counter'], size && styles[`mtsds-counter--size--${size}`]);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(blockStyles, className),
    ref: ref,
    "aria-label": ariaLabel
  });
});
const CounterWithValue = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size,
    ariaLabel,
    variant = 'secondary',
    contextBackgroundColor = 'primary',
    value = 0,
    max = Number.POSITIVE_INFINITY,
    className,
    ...rest
  } = props;
  const blockStyles = cn(styles['mtsds-counter'], size && styles[`mtsds-counter--size--${size}`], variant && styles[`mtsds-counter--variant--${variant}`], contextBackgroundColor && variant !== 'primary' && styles[`mtsds-counter--background-variant--${contextBackgroundColor}`]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      className: cn(blockStyles, className),
      ref: ref,
      "aria-label": ariaLabel
    }, value > max ? `${max}+` : value)
  );
});

/**
 * Компонент Counter
 */
const Counter = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size
  } = props;

  // eslint-disable-next-line react/jsx-props-no-spreading
  return size === 'notification' ? /*#__PURE__*/React.createElement(Notification, {
    ...props,
    ref: ref
  }) : /*#__PURE__*/React.createElement(CounterWithValue, {
    ...props,
    ref: ref
  });
});

export { Counter, CounterWithValue };
