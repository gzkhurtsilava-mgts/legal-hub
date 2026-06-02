'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './divider.module.scss.js';

const Divider = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    withMargin,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("hr", {
    ...rest,
    ref: ref,
    className: cn(styles['mtsds-divider'], className, withMargin && styles['mtsds-divider--margin'])
  });
});

export { Divider };
