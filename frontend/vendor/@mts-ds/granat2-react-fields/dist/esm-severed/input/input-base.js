'use client';
import * as React from 'react';
import { forwardRef, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { mergeRefs } from '@mts-ds/react-utils';
import { Tooltip } from '@mts-ds/granat2-react-tooltip/severed';
import styles from './input.module.scss.js';
import { CheckIcon } from './assets/check.js';
import { WarningIcon } from './assets/warning.js';
import { ButtonIcon } from '../granat2-react/packages/button/dist/esm/button-icon/button-icon.js';
import { InfoIcon } from './assets/info.js';
import { CopyIcon } from './assets/copy.js';
import { CloseIcon } from './assets/close.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const InputBase = (props, ref) => {
  const {
    rootRef,
    value,
    size = 'm',
    disabled = false,
    hideValidationIcon = false,
    hideCopyIcon = false,
    hideClearIcon = false,
    disabledReason,
    contextBackgroundColor = 'primary',
    state,
    postfix,
    placeholder,
    slotStart,
    slotEnd,
    className,
    children,
    readOnly,
    onButtonClear,
    onButtonCopy,
    onCopy,
    onChange,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value ?? inputRef.current?.value);
  const visibleCheckIcon = !hideValidationIcon && state === 'valid' && !isFocused && !disabled;
  const visibleWarningIcon = !hideValidationIcon && state === 'invalid' && !isFocused && !disabled;
  const visibleInfoIcon = !hasValue && !!disabledReason && disabled;
  const visibleCopyIcon = !hideCopyIcon && hasValue && disabled;
  const visibleClearIcon = !hideClearIcon && hasValue && isFocused && !readOnly;
  const visiblePostfix = Boolean(postfix);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    React.createElement("div", {
      ref: rootRef,
      "data-focused": isFocused,
      "data-disabled": disabled,
      "data-filled": hasValue,
      "data-state": state,
      "data-has-slot-start": !!slotStart,
      "data-has-slot-end": !!slotEnd,
      className: clsx(styles['mtsds-input__wrapper'], styles[`mtsds-input__wrapper--size--${size}`], styles[`mtsds-input__wrapper--context--${contextBackgroundColor}`], {
        [styles['mtsds-input--with-postfix']]: !!postfix,
        [styles['mtsds-input--with-reason']]: !!disabledReason && disabled,
        [styles['mtsds-input__wrapper--has--slotStart']]: !!slotStart,
        [styles['mtsds-input__wrapper--state--invalid']]: state === 'invalid'
      }),
      onClick: () => {
        inputRef.current?.focus();
      }
    }, slotStart && /*#__PURE__*/React.createElement("span", {
      className: styles['mtsds-input--slot--start-button']
    }, slotStart), visiblePostfix && /*#__PURE__*/React.createElement("span", {
      className: styles['mtsds-input--slot--postfix']
    }, /*#__PURE__*/React.createElement("span", {
      className: styles['mtsds-input--slot--postfix--value']
    }, value || 0), /*#__PURE__*/React.createElement("span", {
      className: styles['mtsds-input--slot--postfix--measure']
    }, postfix)), /*#__PURE__*/React.createElement("input", {
      ref: mergeRefs(ref, inputRef),
      className: clsx(className, styles['mtsds-input']),
      placeholder: placeholder,
      value: value,
      disabled: disabled,
      readOnly: readOnly,
      onChange: event => {
        onChange?.(event);
      },
      onFocus: event => {
        setIsFocused(true);
        onFocus?.(event);
      },
      onBlur: event => {
        setIsFocused(false);
        onBlur?.(event);
      },
      ...restProps
    }), visibleCheckIcon && /*#__PURE__*/React.createElement(CheckIcon, {
      className: styles['mtsds-input__wrapper--state--icon']
    }), visibleWarningIcon && /*#__PURE__*/React.createElement(WarningIcon, {
      className: styles['mtsds-input__wrapper--state--icon']
    }), visibleInfoIcon && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-input--slot--end-button']
    }, /*#__PURE__*/React.createElement(Tooltip, {
      text: disabledReason
    }, /*#__PURE__*/React.createElement(ButtonIcon, {
      variant: "ghost",
      size: 32,
      "aria-hidden": true,
      tabIndex: -1
    }, /*#__PURE__*/React.createElement(InfoIcon, null)))), visibleCopyIcon && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-input--slot--end-button']
    }, /*#__PURE__*/React.createElement(ButtonIcon, {
      variant: "ghost",
      size: 32,
      onClick: event => {
        event.stopPropagation();
        event.preventDefault();
        onButtonCopy?.({
          event,
          ref: inputRef
        });
      }
    }, /*#__PURE__*/React.createElement(CopyIcon, null))), visibleClearIcon && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-input--slot--end-button']
    }, /*#__PURE__*/React.createElement(ButtonIcon, {
      onClick: event => {
        onButtonClear?.({
          ref: inputRef,
          event
        });
        if (inputRef.current) {
          onChange?.({
            target: {
              value: ''
            },
            currentTarget: {
              value: ''
            }
          });
        }
      },
      onMouseDown: event => {
        event.preventDefault();
      },
      variant: "ghost",
      size: 32
    }, /*#__PURE__*/React.createElement(CloseIcon, null))), slotEnd && /*#__PURE__*/React.createElement("span", {
      className: clsx(styles['mtsds-input--slot--end-button'], {
        [styles['mtsds-input__wrapper--slot--hidden']]: visibleCheckIcon || visibleClearIcon || visibleWarningIcon || visibleInfoIcon || visibleCopyIcon
      })
    }, slotEnd))
  );
};
const componentWithRef = /*#__PURE__*/forwardRef(InputBase);

export { componentWithRef as InputBase };
