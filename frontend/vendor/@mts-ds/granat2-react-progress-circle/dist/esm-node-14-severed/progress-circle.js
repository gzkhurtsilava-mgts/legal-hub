'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import SvgDone from './granat2/src/components/progress-circle/assets/done.svg.js';
import SvgError from './granat2/src/components/progress-circle/assets/error.svg.js';
import styles from './progress-circle.module.scss.js';

const maxPercent = 100;
const ProgressCircle = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    value = 0,
    size = 'm',
    status = 'loading',
    statusText,
    className,
    ...rest
  } = props;
  const renderValue = useMemo(() => {
    if (value < 0) return 0;
    return value >= maxPercent ? maxPercent : Math.floor(value);
  }, [value]);
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(className, styles['mtsds-progress-circle'], styles[`mtsds-progress-circle--size--${size}`], styles[`mtsds-progress-circle--status--${status}`]),
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-circle__circle'])
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-circle__inner'])
  }, (status === 'loading' || status === 'pause') && /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-circle__percent'])
  }, `${renderValue}%`), (status === 'success' || status === 'error') && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-progress-circle__icon']
  }, status === 'success' ? /*#__PURE__*/React.createElement(SvgDone, null) : /*#__PURE__*/React.createElement(SvgError, null))), /*#__PURE__*/React.createElement("svg", {
    className: cn(styles['mtsds-progress-circle__range']),
    viewBox: "0 0 120 120"
  }, /*#__PURE__*/React.createElement("circle", {
    className: cn(styles['mtsds-progress-circle__indicator']),
    cx: "60",
    cy: "60",
    r: "57"
  }), /*#__PURE__*/React.createElement("circle", {
    className: cn(styles['mtsds-progress-circle__value']),
    style: {
      '--mtsds-progress-circle__value--stroke-dasharray': `${renderValue}`
    },
    cx: "60",
    cy: "60",
    r: "57"
  }))), (status === 'pause' || status === 'error') && /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-circle__status-text'])
  }, statusText));
});

export { ProgressCircle };
