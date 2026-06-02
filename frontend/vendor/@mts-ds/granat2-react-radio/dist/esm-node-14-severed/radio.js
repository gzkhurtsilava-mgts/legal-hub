'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import styles from './radio.module.scss.js';
import { RadioIcon } from './radio-icon.js';

const Radio = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size = 24,
    checked,
    invalid,
    disabled,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("span", {
    className: cn(styles['mtsds-radio'], styles[`mtsds-radio--size--${size}`], invalid && [styles[`mtsds-radio--state--invalid`], checked && styles[`mtsds-radio--state--invalid-checked`]], disabled && checked && styles[`mtsds-radio--state--disabled-checked`])
  }, /*#__PURE__*/React.createElement("input", {
    ...rest,
    className: cn(className, styles['mtsds-radio__input']),
    checked: checked,
    type: "radio",
    disabled: disabled,
    "aria-disabled": disabled,
    ref: ref
  }), /*#__PURE__*/React.createElement(RadioIcon, {
    size: size
  }));
});

export { Radio };
