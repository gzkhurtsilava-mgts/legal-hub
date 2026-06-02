'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import cn from 'clsx';
import styles from './toast.module.scss.js';

/**
 * Компонент Toast
 */

const Toast = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    message,
    title,
    device,
    avatar,
    icon,
    className,
    ...rest
  } = props;
  const preparedAvatar = useMemo(() => {
    let avatarWithSize;
    if (avatar) {
      avatarWithSize = /*#__PURE__*/React.cloneElement(avatar, {
        size: 44
      });
    }
    return avatarWithSize;
  }, [avatar]);
  const blockStyles = cn(styles['mtsds-toast'], {
    'desktop': styles['mtsds-toast--device--desktop'],
    'mobile': styles['mtsds-toast--device--mobile']
  }[device]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      className: cn(className, blockStyles),
      ref: ref
    }, title && /*#__PURE__*/React.createElement("strong", {
      className: styles['mtsds-toast__title']
    }, title), /*#__PURE__*/React.createElement("p", {
      className: styles['mtsds-toast__description']
    }, message), preparedAvatar && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-toast__avatar']
    }, preparedAvatar), !preparedAvatar && icon && /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-toast__icon'])
    }, icon))
  );
});

export { Toast };
