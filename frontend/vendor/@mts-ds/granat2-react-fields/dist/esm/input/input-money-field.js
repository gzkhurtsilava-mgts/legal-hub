'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import { compose } from '../packages/shared/src/compose/index.js';
import { currencyMask } from '../packages/shared/src/masks/currency-mask.js';
import { numericValidator } from '../packages/shared/src/validators/numeric-validator.js';
import { InputBase as componentWithRef$2 } from './input-base.js';
import { Field as componentWithRef$1 } from '../field/field.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputMoneyField = (props, ref) => {
  const {
    id,
    name,
    className,
    required,
    disabled = false,
    value,
    onChange,
    onButtonClear,
    label,
    description,
    contextBackgroundColor,
    postfix = '',
    slotProps,
    error,
    size,
    hint,
    max = Number.MAX_SAFE_INTEGER,
    ...restProps
  } = props;
  const currencyCompose = useMemo(() => compose(numericValidator, currencyMask), []);
  const onChangeValue = event => {
    const clearableValue = event.currentTarget.value.replace(/\s/g, '');
    if (max && Number(clearableValue) >= max) {
      return;
    }
    const {
      numberParts
    } = currencyCompose({
      numberParts: [clearableValue]
    });
    onChange?.({
      ...event,
      target: {
        ...event.target,
        value: numberParts[0]
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
    placeholder: undefined,
    postfix: postfix,
    max: max,
    ...restProps
  }));
};
const componentWithRef = /*#__PURE__*/forwardRef(InputMoneyField);

export { componentWithRef as InputMoneyField };
