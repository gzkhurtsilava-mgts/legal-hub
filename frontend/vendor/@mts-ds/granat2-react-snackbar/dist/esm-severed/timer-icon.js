'use client';
import * as React from 'react';
import cn from 'clsx';
import SvgTimer from './granat2/src/components/snackbar/assets/timer.svg.js';
import { useTimeout } from './context.js';
import styles from './snackbar.module.scss.js';

function TimerIcon() {
  const timerValue = useTimeout();
  const blockClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-snackbar__timer']),
    style: {
      '--mtsds-snackbar__timer--value': `${timerValue}ms`
    }
  }, /*#__PURE__*/React.createElement(SvgTimer, {
    className: cn(blockClass)
  }));
}

export { TimerIcon };
