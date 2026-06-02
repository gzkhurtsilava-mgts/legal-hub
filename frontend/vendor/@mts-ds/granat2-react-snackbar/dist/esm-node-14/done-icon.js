'use client';
import * as React from 'react';
import SvgDone from './packages/granat2/src/components/snackbar/assets/done.svg.js';
import cn from 'clsx';
import styles from './snackbar.module.scss.js';

function DoneIcon() {
  const color = 'var(--color-accent-positive-inverted, var(--color-accent-positive))';
  const iconFillStyle = {
    '--mtsds-svg--fill': color
  };
  const blockClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.createElement(SvgDone, {
    style: iconFillStyle,
    className: cn(blockClass)
  });
}

export { DoneIcon };
