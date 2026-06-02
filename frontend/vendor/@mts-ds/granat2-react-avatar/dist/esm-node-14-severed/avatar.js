'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import styles from './avatar.module.scss.js';

const reParseVal = /(-?[\d.]+)([%a-z]*)/;
function parseVal(str) {
  const res = String(str).match(reParseVal);
  return {
    val: res && Number.parseFloat(res[1]),
    unit: res && res[2]
  };
}

/**
 * Компонент Avatar
 */
const Avatar = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    onClick,
    lastName,
    firstName,
    size = 64,
    icon = 'noGender',
    className,
    style,
    children,
    //
    ...rest
  } = props;

  // eslint-disable-next-line consistent-return
  const initials = useMemo(() => {
    const firstNameSymbol = firstName?.slice(0, 1).toUpperCase() || '';
    const lastNameSymbol = lastName?.slice(0, 1).toUpperCase() || '';
    if (lastNameSymbol || firstNameSymbol) {
      if (size === 24) {
        return lastNameSymbol || firstNameSymbol;
      }
      return `${lastNameSymbol}${firstNameSymbol}`;
    }
  }, [firstName, lastName, size]);
  const parsedSizeValue = useMemo(() => parseVal(size), [size]);
  const isCustomSize = !!parsedSizeValue.unit;
  const coercedSize = isCustomSize ? 80 : size;
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
    React.createElement("div", {
      ...rest,
      ref: ref,
      className: cn(className, styles['mtsds-avatar'], styles[`mtsds-avatar--size--${coercedSize}`], !!children && styles['mtsds-avatar--photo']),
      style: {
        ...style,
        ...(isCustomSize ? {
          '--mtsds-avatar--size': size
        } : {})
      },
      onClick: onClick,
      role: "img"
    }, children || initials || icon)
  );
});

export { Avatar };
