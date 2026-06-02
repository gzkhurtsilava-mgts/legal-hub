'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import { Textarea as componentWithRef$2 } from './textarea.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const TextareaField = (props, ref) => {
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
    state,
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
    state: state,
    size: size,
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
const componentWithRef = /*#__PURE__*/forwardRef(TextareaField);

export { componentWithRef as TextareaField };
