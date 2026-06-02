'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import styles from './base-button.module.scss.js';

const BaseButton = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    variant = 'primary',
    waiting,
    fluid,
    disabled,
    size = 44,
    type = 'button',
    tabIndex,
    className,
    contextBackgroundColor = 'primary',
    ...rest
  } = props;
  const buttonVariant = useMemo(() => contextBackgroundColor === 'secondary' ? variant === 'secondary' ? 'secondary-alternative' : variant === 'negative' ? 'negative-alternative' : variant : variant, [contextBackgroundColor, variant]);
  return /*#__PURE__*/React.createElement("button", {
    tabIndex: tabIndex ?? (disabled ? -1 : 0)
    /* eslint-disable-next-line react/button-has-type */,
    type: type,
    disabled: disabled,
    className: cn(className, styles['mtsds-button'], styles[`mtsds-button--variant--${buttonVariant}`], styles[`mtsds-button--size--${size}`], styles['mtsds-action'], disabled && styles['mtsds-button--disabled'], waiting && styles['mtsds-button--loading'], fluid && styles['mtsds-button--fluid']),
    ref: ref,
    "aria-live": waiting ? 'polite' : 'off',
    "aria-busy": !!waiting
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...rest
  }, children, variant !== 'scroll' && size !== 24 && waiting && waiting({
    buttonVariant: variant,
    buttonSize: size
  }));
});

export { BaseButton };
