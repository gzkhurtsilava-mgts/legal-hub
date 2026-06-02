'use client';
import * as React from 'react';
import { forwardRef, cloneElement } from 'react';
import cn from 'clsx';
import styles from './banner-secondary.module.scss.js';
import { CloseButton } from './components/close-button.js';

const Banner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    device = 'desktop',
    variant = 'grey',
    title,
    description,
    actionText,
    actionHref,
    withCloseButton,
    onCloseClick,
    icon,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(className, styles['mtsds-banner-secondary'], styles[`mtsds-banner-secondary--device--${device}`], styles[`mtsds-banner-secondary--color--${variant}`]),
    ref: ref
  }, icon && /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-banner-secondary__icon'])
  }, icon && /*#__PURE__*/cloneElement(icon, {
    inverted: variant === 'inverted'
  })), /*#__PURE__*/React.createElement("strong", {
    className: cn(styles['mtsds-banner-secondary__title'])
  }, title), /*#__PURE__*/React.createElement("p", {
    className: cn(styles['mtsds-banner-secondary__description'])
  }, description, /*#__PURE__*/React.createElement("a", {
    className: cn(styles['mtsds-banner-secondary__action']),
    href: actionHref
  }, actionText)), withCloseButton && /*#__PURE__*/React.createElement(CloseButton, {
    onClick: onCloseClick
  }));
});

export { Banner };
