'use client';
import * as React from 'react';
import styles from '../badge.module.scss.js';

function MtsDsBadgeIcon({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-badge__icon'],
    "aria-hidden": true
  }, children);
}

export { MtsDsBadgeIcon };
