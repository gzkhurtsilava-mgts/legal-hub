'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './card.module.scss.js';

const Card = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    device = 'desktop',
    size = 'm',
    cornerRadius = 32,
    variant = 'default',
    fluid = 'none',
    children,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    ref: ref,
    className: cn(className, styles['mtsds-card'], styles[`mtsds-card--device--${device}`], styles[`mtsds-card--fluid--${fluid}`], styles[`mtsds-card--variant--${variant}`], device === 'desktop' && [styles[`mtsds-card--size--${size}`], size === 'm' && styles[`mtsds-card--corner-radius--${cornerRadius}`]])
  }, children);
});

export { Card };
