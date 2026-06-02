'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import { Button } from '@mts-ds/granat2-react-button';
import { CloseButton } from './components/close-button.js';
import styles from './banner-primary.module.scss.js';

const Banner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    device = 'desktop',
    variant = 'grey',
    size = 'normal',
    title,
    description,
    withCloseButton,
    onCloseClick,
    actions,
    className,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(className, styles['mtsds-banner-primary'], device === 'mobile' && styles[`mtsds-banner-primary--device--mobile`], size === 'small' && styles[`mtsds-banner-primary--size--small`], variant === 'white' && styles[`mtsds-banner-primary--variant--white`]),
    ref: ref
  }, /*#__PURE__*/React.createElement("strong", {
    className: cn(styles['mtsds-banner-primary__title'])
  }, title), /*#__PURE__*/React.createElement("p", {
    className: cn(styles['mtsds-banner-primary__description'])
  }, description), /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-banner-primary__actions'])
  }, actions.map(btn =>
  /*#__PURE__*/
  // eslint-disable-next-line react/jsx-props-no-spreading
  React.createElement(Button, {
    ...btn
  })), withCloseButton && /*#__PURE__*/React.createElement(CloseButton, {
    size: size === 'small' ? 32 : 44,
    variant: "secondary",
    contextBackgroundColor: variant === 'white' ? 'primary' : 'secondary',
    onClick: onCloseClick
  })));
});

export { Banner };
