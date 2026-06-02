'use client';
import * as React from 'react';
import styles from './switch.module.scss.js';

const SwitchIcon = function SwitchIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    className: styles['mtsds-switch__icon-lock'],
    viewBox: "0 0 16 16",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12.98 6.13a3.03 3.03 0 0 0-.8-.6l-.01-.14c-.09-1.64-.13-2.47-.99-3.36a4.7 4.7 0 0 0-.23-.22C10 1 9.35 1 8 1c-1.34 0-2.01 0-2.95.8l-.23.23c-.86.9-.9 1.72-.99 3.36v.13c-.29.14-.55.34-.81.6-.9.92-.93 1.72-1 3.34a12.02 12.02 0 0 0 0 1.08c.07 1.62.1 2.42 1 3.33.9.92 1.79.97 3.58 1.08a22.52 22.52 0 0 0 2.8 0c1.8-.1 2.69-.16 3.58-1.08.9-.9.93-1.71 1-3.33a12.05 12.05 0 0 0 0-1.08c-.07-1.62-.1-2.42-1-3.33ZM5.9 3.07c-.39.4-.47.64-.55 2.07a30.49 30.49 0 0 1 4.05-.1c.47.04.89.06 1.25.1-.08-1.43-.16-1.67-.55-2.07a1.7 1.7 0 0 0-.8-.5A6.52 6.52 0 0 0 8 2.5c-.72 0-1.04 0-1.3.06-.31.08-.58.28-.8.5ZM9 10a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
  }));
};

export { SwitchIcon };
