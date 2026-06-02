'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import { ControlListSizeContext } from './context/size-context.js';
import styles from './control-list.module.scss.js';

const ControlList = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    size = 'm',
    middle,
    separator,
    className,
    ...rest
  } = props;
  const sizeValue = useMemo(() => ({
    size
  }), [size]);
  return /*#__PURE__*/React.createElement(ControlListSizeContext.Provider, {
    value: sizeValue
  }, /*#__PURE__*/React.createElement("ul", {
    ...rest,
    className: cn(className, styles['mtsds-control-list'], styles[`mtsds-control-list--size-${size}`], middle && styles['mtsds-control-list--middle'], separator && styles['mtsds-control-list--separator']),
    ref: ref
  }, children));
});

export { ControlList };
