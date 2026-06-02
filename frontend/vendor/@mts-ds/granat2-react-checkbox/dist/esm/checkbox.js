'use client';
import * as React from 'react';
import { forwardRef, useState } from 'react';
import cn from 'clsx';
import styles from './checkbox.module.scss.js';
import { CheckboxIcon } from './checkbox-icon.js';

const internalCheckedStateOrder = [null, true, false];
const Checkbox = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size = 24,
    checked,
    defaultChecked,
    onChange,
    invalid,
    useIndeterminate = false,
    disabled,
    className,
    nativeIndeterminateValue = false,
    ...rest
  } = props;
  const isControlled = typeof checked !== 'undefined';
  const isDefaultChecked = typeof defaultChecked !== 'undefined';
  const [internalChecked, setInternalChecked] = useState(isDefaultChecked && defaultChecked);
  const indexInternalCheckedState = internalCheckedStateOrder.indexOf(internalChecked);
  const nextState = indexInternalCheckedState >= internalCheckedStateOrder.length - 1 ? 0 : indexInternalCheckedState + 1;
  const onChangeHandler = e => {
    if (!isControlled) {
      if (useIndeterminate) {
        e.indeterminate = true;
        setInternalChecked(internalCheckedStateOrder[nextState]);
      } else {
        e.indeterminate = false;
        setInternalChecked(e.target.checked);
      }
    }
    onChange?.(e);
  };
  return /*#__PURE__*/React.createElement("span", {
    className: cn(styles['mtsds-checkbox'], styles[`mtsds-checkbox--size--${size}`], (internalChecked === null || checked === null) && styles[`mtsds-checkbox--state--indeterminate`], (internalChecked === null || checked === null) && invalid && styles[`mtsds-checkbox--state--invalid-indeterminate`], (internalChecked === null || checked === null) && disabled && styles[`mtsds-checkbox--state--disabled-indeterminate`], invalid && [styles[`mtsds-checkbox--state--invalid`], (checked || internalChecked) && styles[`mtsds-checkbox--state--invalid-checked`]], disabled && (checked || internalChecked) && styles[`mtsds-checkbox--state--disabled-checked`])
  }, /*#__PURE__*/React.createElement("input", {
    ...rest,
    className: cn(className, styles['mtsds-checkbox__input']),
    checked: (isControlled ? checked : internalChecked) ?? nativeIndeterminateValue,
    onChange: onChangeHandler,
    type: "checkbox",
    disabled: disabled,
    "aria-disabled": disabled,
    ref: ref
  }), /*#__PURE__*/React.createElement(CheckboxIcon, {
    size: size
  }));
});

export { Checkbox };
