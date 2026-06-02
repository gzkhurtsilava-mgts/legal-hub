'use client';
import * as React from 'react';
import { forwardRef, cloneElement } from 'react';
import cn from 'clsx';
import styles from './banner-tertiary.module.scss.js';

const Banner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    description,
    variant = 'grey',
    icon = 'info',
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(className, styles['mtsds-banner-tertiary'], styles[`mtsds-banner-tertiary--color--${variant}`]),
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-banner-tertiary__icon'])
  }, /*#__PURE__*/cloneElement(icon, {
    inverted: variant === 'inverted'
  })), /*#__PURE__*/React.createElement("p", {
    className: cn(styles['mtsds-banner-tertiary__description'])
  }, description));
});

export { Banner };
