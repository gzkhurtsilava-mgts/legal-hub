'use client';
import * as React from 'react';
import SvgInfo from './packages/granat2/src/components/toast/assets/info.svg.js';
import cn from 'clsx';
import styles from './toast.module.scss.js';

function InfoIcon() {
  const color = 'var(--color-accent-active-inverted, var(--color-accent-active))';
  const iconFillStyle = {
    '--mtsds-svg--fill': color
  };
  const blockClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.createElement(SvgInfo, {
    style: iconFillStyle,
    className: cn(blockClass)
  });
}

export { InfoIcon };
