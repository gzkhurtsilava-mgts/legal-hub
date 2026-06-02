'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import { InputBase as componentWithRef$2 } from './input-base.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputField = (props, ref) => {
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
    state,
    hint,
    maxLength,
    ...restProps
  } = props;
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
    state: state,
    hint: hint,
    slotProps: {
      label: slotProps?.label,
      description: slotProps?.description
    },
    ...slotProps?.field
  }, /*#__PURE__*/React.createElement(componentWithRef$2, {
    ref: ref,
    state: state,
    ...restProps
  }));
};
const componentWithRef = /*#__PURE__*/forwardRef(InputField);

export { componentWithRef as InputField };
