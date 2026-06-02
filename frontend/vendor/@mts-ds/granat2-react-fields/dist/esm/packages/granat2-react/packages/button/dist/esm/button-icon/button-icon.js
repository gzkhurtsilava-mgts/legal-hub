'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import { BaseButton } from '../base-button/base-button.js';
import styles from './button-icon.module.scss.js';

const ButtonIcon = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    variant = 'primary',
    counter,
    className,
    ...rest
  } = props;
  const modifiedIcon = useMemo(() => /*#__PURE__*/React.cloneElement(children, {
    className: cn(styles['mtsds-icon'], styles['mtsds-svg'])
  }), [children]);
  const modifiedCounter = useMemo(() => {
    if (!counter) return null;
    return /*#__PURE__*/React.cloneElement(counter, {
      className: cn(counter.props.className, counter.props.size === 'notification' ? styles['mtsds-notification'] : styles['mtsds-counter'], variant === 'primary' && styles['mtsds-counter--alternative'])
    });
  }, [counter, variant]);
  return /*#__PURE__*/React.createElement(BaseButton, {
    className: cn(styles['mtsds-button-icon'], className),
    ref: ref,
    variant: variant
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,

    ...rest
  }, modifiedCounter, modifiedIcon);
});

export { ButtonIcon };
