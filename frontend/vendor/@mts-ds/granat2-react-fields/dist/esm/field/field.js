'use client';
import * as React from 'react';
import { forwardRef, cloneElement } from 'react';
import { clsx } from 'clsx';
import { isReactValidElement, mergeProps } from '@mts-ds/react-utils';
import { useFieldAria } from './utils.js';
import styles from './field.module.scss.js';
import { InputBase as componentWithRef$1 } from '../input/input-base.js';
import { Textarea as componentWithRef$2 } from '../textarea/textarea.js';
import { Label as componentWithRef$3 } from '../label/label.js';
import { Description as componentWithRef$4 } from '../description/description.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const Field = (props, ref) => {
  const {
    id,
    name,
    required,
    disabled = false,
    error,
    size,
    state,
    contextBackgroundColor = 'primary',
    label,
    description,
    disabledReason,
    hint,
    slotProps,
    className,
    children
  } = props;
  const {
    label: labelSlotProps,
    description: descriptionSlotProps
  } = slotProps ?? {};
  const floating = size === 'xl';
  const isInvalidField = error && !disabled || state === 'invalid';
  const {
    labelArea,
    fieldArea,
    descriptionArea
  } = useFieldAria({
    id,
    disabled,
    invalid: isInvalidField
  });
  const control = React.Children.map(children, child => {
    if (!isReactValidElement(child)) {
      return child;
    }
    const extraProps = {
      name,
      required,
      size,
      contextBackgroundColor,
      state: isInvalidField ? 'invalid' : state,
      ...fieldArea
    };
    if (child.type === componentWithRef$1) {
      return /*#__PURE__*/cloneElement(child, mergeProps(child.props, {
        disabledReason,
        ...extraProps
      }));
    }
    if (child.type === componentWithRef$2) {
      return /*#__PURE__*/cloneElement(child, mergeProps(child.props, {
        ...extraProps
      }));
    }
    return child;
  });
  const LabelComponent = /*#__PURE__*/React.createElement(componentWithRef$3, {
    size: size,
    required: required,
    disabled: disabled,
    floating: floating,
    invalid: isInvalidField,
    hint: hint,
    contextBackgroundColor: contextBackgroundColor,
    ...mergeProps(labelSlotProps, labelArea)
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: clsx(styles['mtsds-field__wrapper'], className)
  }, label && !floating && LabelComponent, /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-field']
  }, control, label && floating && LabelComponent), (typeof error === 'string' || description) && /*#__PURE__*/React.createElement(componentWithRef$4, {
    invalid: isInvalidField,
    ...mergeProps(descriptionSlotProps, descriptionArea)
  }, error || description));
};
const componentWithRef = /*#__PURE__*/forwardRef(Field);

export { componentWithRef as Field };
