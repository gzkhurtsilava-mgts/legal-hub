'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import { Text } from '@mts-ds/granat2-react-internal-text';
import styles from './button.module.scss.js';
import { BaseButton } from '../base-button/base-button.js';
import { getTextFont, getTextColor } from '../utils/text-utils.js';

const Button = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    variant = 'primary',
    size = 44,
    children,
    icon,
    iconPosition = 'left',
    disabled,
    className,
    ...rest
  } = props;
  const modifiedIcon = useMemo(() => icon && /*#__PURE__*/React.cloneElement(icon, {
    className: cn(styles['mtsds-icon'], styles['mtsds-svg'])
  }), [icon]);
  const textFont = useMemo(() => getTextFont({
    size
  }), [size]);
  const textColor = useMemo(() => getTextColor({
    disabled,
    variant
  }), [variant, disabled]);
  return /*#__PURE__*/React.createElement(BaseButton, {
    variant: variant,
    size: size,
    disabled: disabled,
    className: cn(styles['mtsds-button-text-icon'], className),
    ref: ref
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...rest
  }, iconPosition === 'left' && modifiedIcon, /*#__PURE__*/React.createElement(Text, {
    as: "span",
    font: textFont,
    color: textColor,
    className: styles['mtsds-button__text'],
    truncate: true
  }, children), iconPosition === 'right' && modifiedIcon);
});

export { Button };
