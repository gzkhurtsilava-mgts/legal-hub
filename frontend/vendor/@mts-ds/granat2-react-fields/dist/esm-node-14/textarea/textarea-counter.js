'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './textarea-counter.module.scss.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const TextareaCounter = (props, ref) => {
  const {
    count: countRaw,
    maxCount,
    className,
    children,
    ...restProps
  } = props;
  const count = typeof countRaw === 'string' ? countRaw.length : countRaw;
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: cn(styles['mtsds-textarea-counter'], className, count > maxCount && styles['mtsds-textarea-counter--state--invalid']),
    ...restProps
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true
  }, count, " / ", maxCount), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      fontSize: 0
    }
  }, count, " \u0438\u0437 ", maxCount, " \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"));
};
const componentWithRef = /*#__PURE__*/forwardRef(TextareaCounter);

export { componentWithRef as TextareaCounter };
