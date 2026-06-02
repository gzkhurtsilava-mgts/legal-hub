'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from '../control-list.module.scss.js';

const ControlCell = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    disabled,
    label,
    description,
    invalid,
    className,
    ...rest
  } = props;
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    React.createElement("label", {
      ...rest,
      className: cn(className, styles['mtsds-control-list__label'], disabled && styles['mtsds-control-list__label--disabled'], invalid && styles['mtsds-control-list__label--invalid']),
      "data-trigger-hover": "mtsds-checkbox mtsds-radio",
      ref: ref
    }, /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-control-list__label-input']
    }, children), label && /*#__PURE__*/React.createElement("p", {
      className: styles['mtsds-control-list__label-name']
    }, label), description && /*#__PURE__*/React.createElement("p", {
      className: styles['mtsds-control-list__label-description']
    }, description))
  );
});

export { ControlCell };
