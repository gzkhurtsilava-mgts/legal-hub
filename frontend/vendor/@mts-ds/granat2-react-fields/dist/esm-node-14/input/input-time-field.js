'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import { compose } from '../packages/shared/src/compose/index.js';
import { numericValidator } from '../packages/shared/src/validators/numeric-validator.js';
import { timeValidator } from '../packages/shared/src/validators/time-validator.js';
import { InputBase as componentWithRef$2 } from './input-base.js';
import { ButtonIcon } from '../packages/granat2-react/packages/button/dist/esm/button-icon/button-icon.js';
import { TimeIcon } from './assets/time.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputTimeField = (props, ref) => {
  const {
    id,
    name,
    className,
    required,
    disabled = false,
    value = '',
    placeholder = 'чч:мм',
    label,
    description,
    contextBackgroundColor,
    slotProps,
    error,
    size,
    hint,
    max,
    onChange,
    onButtonTime,
    timeRef,
    slotEnd = /*#__PURE__*/React.createElement(ButtonIcon, {
      ref: timeRef,
      size: 32,
      variant: "ghost",
      type: "button",
      onClick: onButtonTime,
      onMouseDown: event => {
        event.preventDefault();
      }
    }, /*#__PURE__*/React.createElement(TimeIcon, null)),
    ...restProps
  } = props;
  const timeCompose = useMemo(() => compose(numericValidator, timeValidator), []);
  const onChangeValue = event => {
    const inputValue = event.target.value;
    const {
      numberParts
    } = timeCompose({
      numberParts: [inputValue]
    });
    onChange?.({
      ...event,
      target: {
        ...event.target,
        value: numberParts.join(':')
      }
    });
  };
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
    type: "text",
    value: value,
    onChange: onChangeValue,
    placeholder: placeholder,
    max: max,
    slotEnd: slotEnd,
    hideClearIcon: true,
    ...restProps
  }));
};
const componentWithRef = /*#__PURE__*/forwardRef(InputTimeField);

export { componentWithRef as InputTimeField };
