'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import { compose } from '../shared/src/compose/index.js';
import { dateValidator } from '../shared/src/validators/date-validator.js';
import { numericValidator } from '../shared/src/validators/numeric-validator.js';
import { InputBase as componentWithRef$2 } from './input-base.js';
import { ButtonIcon } from '../granat2-react/packages/button/dist/esm/button-icon/button-icon.js';
import { DateIcon } from './assets/date.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputCalendarField = (props, ref) => {
  const {
    id,
    name,
    className,
    required,
    disabled = false,
    value = '',
    placeholder = 'дд.мм.гг',
    label,
    description,
    contextBackgroundColor,
    slotProps,
    error,
    size,
    hint,
    max,
    onChange,
    onButtonCalendar,
    calendarRef,
    slotEnd = /*#__PURE__*/React.createElement(ButtonIcon, {
      ref: calendarRef,
      size: 32,
      variant: "ghost",
      type: "button",
      onClick: onButtonCalendar,
      onMouseDown: event => {
        event.preventDefault();
      }
    }, /*#__PURE__*/React.createElement(DateIcon, null)),
    ...restProps
  } = props;
  const dateCompose = useMemo(() => compose(numericValidator, dateValidator), []);
  const onChangeValue = event => {
    const inputValue = event.target.value;
    const {
      numberParts
    } = dateCompose({
      numberParts: [inputValue]
    });
    onChange?.({
      ...event,
      target: {
        ...event.target,
        value: numberParts.join('.')
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
const componentWithRef = /*#__PURE__*/forwardRef(InputCalendarField);

export { componentWithRef as InputCalendarField };
