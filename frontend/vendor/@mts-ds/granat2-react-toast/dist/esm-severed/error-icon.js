'use client';
import * as React from 'react';
import SvgError from './granat2/src/components/toast/assets/error.svg.js';
import cn from 'clsx';
import styles from './toast.module.scss.js';

function ErrorIcon() {
  const color = 'var(--color-accent-negative-inverted, var(--color-accent-negative))';
  const iconFillStyle = {
    '--mtsds-svg--fill': color
  };
  const blockClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.createElement(SvgError, {
    style: iconFillStyle,
    className: cn(blockClass)
  });
}

export { ErrorIcon };
