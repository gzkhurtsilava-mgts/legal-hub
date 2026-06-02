'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import SvgDone from './granat2/src/components/progress-linear/assets/done.svg.js';
import SvgError from './granat2/src/components/progress-linear/assets/error.svg.js';
import styles from './progress-linear.module.scss.js';

const maxPercent = 100;
const ProgressLinear = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    value = 0,
    size = 'm',
    withPercent,
    status = 'loading',
    statusText,
    className,
    ...rest
  } = props;
  const renderValue = useMemo(() => {
    if (value < 0) return 0;
    return value >= maxPercent ? maxPercent : Math.floor(value);
  }, [value]);
  const statusBlock = /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__status'])
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__status-text'])
  }, statusText), (status === 'error' || status === 'success') && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-progress-linear__status-icon']
  }, status === 'success' ? /*#__PURE__*/React.createElement(SvgDone, null) : /*#__PURE__*/React.createElement(SvgError, null)));
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn('mtsds-progress-linear', styles[`mtsds-progress-linear--size--${size}`], styles[`mtsds-progress-linear--status--${status}`], className),
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__bar'])
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__indicator']),
    style: {
      '--mtsds-progress-linear__indicator--width': `${renderValue}`
    }
  }, size === 'l' && /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__indicator-text'])
  }, status === 'success' ? 'Завершено' : status === 'error' ? 'Ошибка' : `${renderValue}%`))), size !== 'l' && withPercent && status === 'loading' && /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-progress-linear__indicator-text'])
  }, `${renderValue}%`), size === 'l' ? status === 'error' ? statusBlock : null : status !== 'loading' ? statusBlock : null);
});

export { ProgressLinear };
