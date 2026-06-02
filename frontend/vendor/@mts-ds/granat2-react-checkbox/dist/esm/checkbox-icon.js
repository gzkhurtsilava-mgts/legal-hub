'use client';
import * as React from 'react';
import cn from 'clsx';
import styles from './checkbox.module.scss.js';

const CheckboxIcon = function CheckboxIcon({
  size
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, size === 16 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-checkbox__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-checkbox__icon--display, none)'
    },
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-bg'],
    d: "M2.05 6.62c.13-1.75.2-2.62 1.07-3.5.88-.87 1.75-.94 3.5-1.06a18.74 18.74 0 0 1 2.76 0c1.75.12 2.62.19 3.5 1.07.87.87.94 1.74 1.07 3.49a18.76 18.76 0 0 1 0 2.77c-.13 1.74-.2 2.61-1.07 3.49-.88.87-1.75.94-3.5 1.07a18.76 18.76 0 0 1-2.77 0c-1.74-.13-2.61-.2-3.49-1.07-.87-.88-.94-1.75-1.07-3.5a18.73 18.73 0 0 1 0-2.76Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-border'],
    strokeWidth: "1.5",
    d: "M2.8 6.67c.14-1.8.2-2.37.85-3.01.65-.65 1.23-.72 3.02-.86a17.98 17.98 0 0 1 2.66 0c1.8.14 2.37.2 3.02.86.64.64.71 1.22.85 3.01a17.99 17.99 0 0 1 0 2.66c-.14 1.8-.2 2.37-.85 3.02-.65.64-1.23.72-3.02.85a17.99 17.99 0 0 1-2.66 0c-1.8-.13-2.37-.2-3.02-.85-.64-.65-.71-1.23-.85-3.02a17.99 17.99 0 0 1 0-2.66Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-check'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.78 6.95a.75.75 0 0 0-1.06-1.06L7.33 8.27 6.28 7.22a.75.75 0 0 0-1.06 1.06L6.8 9.86c.3.3.77.3 1.06 0l2.92-2.91Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-minus'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.75 7.25a.75.75 0 1 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-opacity'],
    d: "M2.05 6.62c.13-1.75.2-2.62 1.07-3.5.88-.87 1.75-.94 3.5-1.06a18.74 18.74 0 0 1 2.76 0c1.75.12 2.62.19 3.5 1.07.87.87.94 1.74 1.07 3.49a18.76 18.76 0 0 1 0 2.77c-.13 1.74-.2 2.61-1.07 3.49-.88.87-1.75.94-3.5 1.07a18.76 18.76 0 0 1-2.77 0c-1.74-.13-2.61-.2-3.49-1.07-.87-.88-.94-1.75-1.07-3.5a18.73 18.73 0 0 1 0-2.76Z"
  })), size === 24 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-checkbox__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-checkbox__icon--display, none)'
    },
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-bg'],
    d: "M3.08 9.92c.2-2.61.3-3.92 1.6-5.23C6 3.37 7.32 3.28 9.93 3.09a28.1 28.1 0 0 1 4.16 0c2.61.19 3.92.28 5.23 1.6 1.32 1.31 1.41 2.62 1.6 5.23a28.14 28.14 0 0 1 0 4.16c-.19 2.61-.28 3.92-1.6 5.24-1.3 1.3-2.62 1.4-5.23 1.6a28.14 28.14 0 0 1-4.16 0c-2.61-.2-3.92-.3-5.23-1.6-1.32-1.32-1.41-2.63-1.6-5.24a28.11 28.11 0 0 1 0-4.16Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-border'],
    strokeWidth: "1.5",
    d: "M3.83 9.98c.2-2.67.3-3.68 1.39-4.76 1.08-1.09 2.1-1.2 4.76-1.39a27.36 27.36 0 0 1 4.04 0c2.67.2 3.68.3 4.76 1.39 1.09 1.08 1.2 2.1 1.39 4.76a27.32 27.32 0 0 1 0 4.04c-.2 2.67-.3 3.68-1.39 4.77-1.08 1.08-2.1 1.18-4.76 1.38a27.32 27.32 0 0 1-4.04 0c-2.67-.2-3.68-.3-4.76-1.38-1.09-1.09-1.2-2.1-1.4-4.77a27.35 27.35 0 0 1 0-4.04Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-check'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16.2 10.2a1 1 0 0 0-1.4-1.4L11 12.58l-1.3-1.3a1 1 0 0 0-1.4 1.42l2 2a1 1 0 0 0 1.4 0l4.5-4.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-minus'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-opacity'],
    d: "M3.08 9.92c.2-2.61.3-3.92 1.6-5.23C6 3.37 7.32 3.28 9.93 3.09a28.1 28.1 0 0 1 4.16 0c2.61.19 3.92.28 5.23 1.6 1.32 1.31 1.41 2.62 1.6 5.23a28.14 28.14 0 0 1 0 4.16c-.19 2.61-.28 3.92-1.6 5.24-1.3 1.3-2.62 1.4-5.23 1.6a28.14 28.14 0 0 1-4.16 0c-2.61-.2-3.92-.3-5.23-1.6-1.32-1.32-1.41-2.63-1.6-5.24a28.11 28.11 0 0 1 0-4.16Z"
  })), size === 32 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-checkbox__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-checkbox__icon--display, none)'
    },
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-bg'],
    d: "M4.1 13.23c.27-3.49.4-5.23 2.15-6.98s3.5-1.88 6.98-2.14a37.47 37.47 0 0 1 5.54 0c3.49.26 5.23.39 6.98 2.14s1.88 3.5 2.14 6.98a37.47 37.47 0 0 1 0 5.54c-.26 3.49-.39 5.23-2.14 6.98s-3.5 1.88-6.98 2.14a37.47 37.47 0 0 1-5.54 0c-3.49-.26-5.23-.39-6.98-2.14s-1.88-3.49-2.14-6.98a37.47 37.47 0 0 1 0-5.54Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-border'],
    strokeWidth: "2",
    d: "M4.86 13.29c.26-3.54.4-4.99 1.92-6.5 1.52-1.53 2.97-1.67 6.5-1.93a36.72 36.72 0 0 1 5.43 0c3.54.26 4.99.4 6.51 1.92 1.52 1.52 1.66 2.97 1.92 6.5a36.7 36.7 0 0 1 0 5.44c-.26 3.53-.4 4.98-1.92 6.5-1.52 1.53-2.97 1.66-6.5 1.93a36.75 36.75 0 0 1-5.43 0c-3.54-.27-4.99-.4-6.51-1.93-1.53-1.52-1.66-2.97-1.92-6.5a36.72 36.72 0 0 1 0-5.43Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-check'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M21.38 11.62c.5.48.5 1.28 0 1.76l-6 6c-.48.5-1.28.5-1.76 0l-2.5-2.5a1.25 1.25 0 0 1 1.76-1.76l1.62 1.61 5.12-5.11a1.25 1.25 0 0 1 1.76 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-minus'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 14.75a1.25 1.25 0 1 0 0 2.5h8a1.25 1.25 0 1 0 0-2.5h-8Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-checkbox__icon-opacity'],
    d: "M4.1 13.23c.27-3.49.4-5.23 2.15-6.98s3.5-1.88 6.98-2.14a37.47 37.47 0 0 1 5.54 0c3.49.26 5.23.39 6.98 2.14s1.88 3.5 2.14 6.98a37.47 37.47 0 0 1 0 5.54c-.26 3.49-.39 5.23-2.14 6.98s-3.5 1.88-6.98 2.14a37.47 37.47 0 0 1-5.54 0c-3.49-.26-5.23-.39-6.98-2.14s-1.88-3.49-2.14-6.98a37.47 37.47 0 0 1 0-5.54Z"
  })));
};

export { CheckboxIcon };
