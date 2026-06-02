'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './spinner.module.scss.js';

const Spinner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    color = 'default',
    size = 24,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("span", {
    ...rest,
    ref: ref,
    role: "status",
    "aria-live": "polite",
    "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430",
    className: cn(className, styles['mtsds-spinner'], styles[`mtsds-spinner--size--${size}`], styles[`mtsds-spinner--color--${color}`])
  });
});

export { Spinner };
