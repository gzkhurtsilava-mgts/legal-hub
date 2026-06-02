'use client';
import * as React from 'react';
import { forwardRef, useState } from 'react';
import { InputBase as componentWithRef$2 } from './input-base.js';
import { ButtonIcon } from '../packages/granat2-react/packages/button/dist/esm/button-icon/button-icon.js';
import { HideEye } from './assets/hide-eye.js';
import { ShowEye } from './assets/show-eye.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputPasswordField = (props, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const onChangeVisibilityPassword = event => {
    event.stopPropagation();
    setIsVisiblePassword(prev => !prev);
  };
  const {
    id,
    name,
    className,
    required,
    disabled = false,
    label,
    description,
    contextBackgroundColor,
    slotProps,
    error,
    size,
    hint,
    maxLength,
    slotEnd = /*#__PURE__*/React.createElement(ButtonIcon, {
      size: 32,
      variant: "ghost",
      type: "button",
      "aria-label": isVisiblePassword ? 'Скрыть пароль' : 'Показать пароль',
      onClick: onChangeVisibilityPassword,
      onMouseDown: event => {
        event.preventDefault();
      }
    }, isVisiblePassword ? /*#__PURE__*/React.createElement(HideEye, null) : /*#__PURE__*/React.createElement(ShowEye, null)),
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const visibleEyeIcon = props.value && !disabled && isFocused;
  return /*#__PURE__*/React.createElement(componentWithRef$1, {
    id: id,
    name: name,
    className: className,
    required: required,
    disabled: disabled,
    label: label,
    description: description,
    contextBackgroundColor: contextBackgroundColor,
    error: error,
    size: size,
    hint: hint,
    slotProps: {
      label: slotProps?.label,
      description: slotProps?.description
    },
    ...slotProps?.field
  }, /*#__PURE__*/React.createElement(componentWithRef$2, {
    ref: ref,
    type: isVisiblePassword ? 'text' : 'password',
    slotEnd: visibleEyeIcon ? slotEnd : undefined,
    disabled: disabled,
    hideClearIcon: true,
    onFocus: event => {
      setIsFocused(true);
      onFocus?.(event);
    },
    onBlur: event => {
      setIsFocused(false);
      onBlur?.(event);
    },
    ...restProps
  }));
};
const componentWithRef = /*#__PURE__*/forwardRef(InputPasswordField);

export { componentWithRef as InputPasswordField };
