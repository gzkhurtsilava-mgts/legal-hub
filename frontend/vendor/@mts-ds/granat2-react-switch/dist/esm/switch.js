'use client';
import * as React from 'react';
import { forwardRef, useState } from 'react';
import cn from 'clsx';
import { SwitchIcon } from './switch-icon.js';
import styles from './switch.module.scss.js';

const Switch = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    name = '',
    value = '',
    size = 24,
    disabled = false,
    checked,
    defaultChecked,
    onChange,
    id,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    className,
    ...rest
  } = props;
  const [internalChecked, setInternalChecked] = useState(typeof defaultChecked !== 'undefined' && defaultChecked);
  const onChangeHandler = event => {
    if (typeof defaultChecked !== 'undefined') setInternalChecked(event.target.checked);
    onChange?.(event);
  };
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      className: cn(styles['mtsds-switch'], styles[`mtsds-switch--size--${size}`], className)
    }, /*#__PURE__*/React.createElement("input", {
      className: styles['mtsds-switch__input'],
      id: id,
      type: "checkbox",
      checked: typeof checked !== 'undefined' ? checked : internalChecked,
      disabled: disabled,
      "aria-disabled": disabled,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      onChange: onChangeHandler,
      name: name,
      value: value,
      ref: ref
    }), /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-switch__switcher'])
    }, size !== 16 && disabled && /*#__PURE__*/React.createElement(SwitchIcon, null)))
  );
});

export { Switch };
