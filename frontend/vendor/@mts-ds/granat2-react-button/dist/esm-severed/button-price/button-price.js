'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import { Text } from '@mts-ds/granat2-react-internal-text/severed';
import { BaseButton } from '../base-button/base-button.js';
import { getTextFont, getTextColor } from '../utils/text-utils.js';
import styles from './button-price.module.scss.js';

const ButtonPrice = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    variant = 'primary',
    size = 44,
    disabled,
    children,
    priceCurrent,
    priceOld,
    currency = '₽',
    className,
    ...rest
  } = props;
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
    className: cn(styles['mtsds-button-text-price'], className),
    ref: ref
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...rest
  }, /*#__PURE__*/React.createElement(Text, {
    className: styles['mtsds-button__text'],
    as: "span",
    font: textFont,
    color: textColor,
    truncate: true
  }, children), priceOld && /*#__PURE__*/React.createElement(Text, {
    className: cn(styles['mtsds-button__text'], styles['mtsds-button__text--price--old']),
    as: "span",
    font: textFont,
    color: textColor,
    truncate: true
  }, priceOld), /*#__PURE__*/React.createElement(Text, {
    className: cn(styles['mtsds-button__text'], styles['mtsds-button__text--price--current']),
    as: "span",
    font: textFont,
    color: textColor,
    truncate: true,
    "data-currency": currency
  }, priceCurrent));
});

export { ButtonPrice };
