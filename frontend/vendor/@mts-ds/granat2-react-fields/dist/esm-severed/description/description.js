'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './description.module.scss.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const Description = (props, ref) => {
  const {
    invalid,
    className,
    children,
    ...restProps
  } = props;
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: cn(styles['mtsds-description'], className, invalid && styles['mtsds-description--state--invalid']),
    ...restProps
  }, children);
};
const componentWithRef = /*#__PURE__*/forwardRef(Description);

export { componentWithRef as Description };
