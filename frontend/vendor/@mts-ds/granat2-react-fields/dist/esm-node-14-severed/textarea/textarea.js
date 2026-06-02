'use client';
import * as React from 'react';
import { forwardRef, useRef, useState } from 'react';
import cn from 'clsx';
import { mergeRefs } from '@mts-ds/react-utils';
import { useAutoresizeTextarea } from './utils.js';
import styles from './textarea.module.scss.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const Textarea = (props, ref) => {
  const {
    value,
    size = 'm',
    state,
    disabled = false,
    rows = 3,
    contextBackgroundColor = 'primary',
    resize = 'auto',
    className,
    children,
    onChange,
    onFocus,
    onBlur,
    ...restProps
  } = props;
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const {
    onAutoResizeTextarea
  } = useAutoresizeTextarea({
    ref: textareaRef,
    enabled: resize === 'auto'
  });
  const hasValue = Boolean(value ?? textareaRef.current?.value);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions,jsx-a11y/no-noninteractive-element-interactions
    React.createElement("div", {
      "data-focused": isFocused,
      "data-filled": hasValue,
      "data-disabled": disabled,
      className: cn(styles['mtsds-textarea__wrapper'], styles[`mtsds-textarea__wrapper--context--${contextBackgroundColor}`], styles[`mtsds-textarea__wrapper--size--${size}`], rows === 1 && styles['mtsds-textarea__pseudo'], state === 'invalid' && styles['mtsds-textarea__wrapper--state--invalid']),
      onClick: () => {
        textareaRef.current?.focus();
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      ref: mergeRefs(ref, textareaRef),
      className: cn(className, styles['mtsds-textarea'], styles[`mtsds-textarea--resize--${resize}`]),
      value: value,
      disabled: disabled,
      rows: rows,
      onChange: event => {
        onChange?.(event);
        onAutoResizeTextarea();
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
    }))
  );
};
const componentWithRef = /*#__PURE__*/forwardRef(Textarea);

export { componentWithRef as Textarea };
