'use client';
import * as React from 'react';
import SvgWarning from './granat2/src/components/snackbar/assets/warning.svg.js';
import cn from 'clsx';
import styles from './snackbar.module.scss.js';

function WarningIcon() {
  const color = 'var(--color-accent-warning-inverted, var(--color-accent-warning))';
  const iconFillStyle = {
    '--mtsds-svg--fill': color
  };
  const blockClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.createElement(SvgWarning, {
    style: iconFillStyle,
    className: cn(blockClass)
  });
}

export { WarningIcon };
