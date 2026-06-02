'use client';
import * as React from 'react';
import cn from 'clsx';
import styles from './radio.module.scss.js';

const RadioIcon = function RadioIcon({
  size
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, size === 16 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-radio__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-radio__icon--display, none)'
    },
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-bg'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-border'],
    strokeWidth: "1.5",
    d: "M3 8a5 5 0 1 1 10 0A5 5 0 0 1 3 8Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-dot'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-opacity'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z"
  })), size === 24 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-radio__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-radio__icon--display, none)'
    },
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-bg'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-border'],
    strokeWidth: "1.5",
    d: "M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-dot'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-opacity'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"
  })), size === 32 && /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-radio__icon'], styles['mtsds-svg']),
    style: {
      display: 'var(--mtsds-radio__icon--display, none)'
    },
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-bg'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-border'],
    strokeWidth: "2",
    d: "M5 16a11 11 0 1 1 22 0 11 11 0 0 1-22 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-dot'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16 9a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: styles['mtsds-radio__icon-opacity'],
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z"
  })));
};

export { RadioIcon };
