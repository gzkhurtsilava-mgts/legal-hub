'use client';
import * as React from 'react';
import SvgWarning from './packages/granat2/src/components/toast/assets/warning.svg.js';
import cn from 'clsx';
import styles from './toast.module.scss.js';

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
