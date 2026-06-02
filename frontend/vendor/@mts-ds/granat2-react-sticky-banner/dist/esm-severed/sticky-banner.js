import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import { ErrorOutlineIcon, WarningOutlineIcon, InfoOutlineIcon, DoneOutlineIcon } from '@mts-ds/granat2-react-internal-banner-icons/severed';
import styles from './sticky-banner.module.scss.js';
import { CloseButton } from './components/close-button.js';

const convertIconVariant = variant => {
  const converter = {
    error: /*#__PURE__*/React.createElement(ErrorOutlineIcon, null),
    warning: /*#__PURE__*/React.createElement(WarningOutlineIcon, null),
    info: /*#__PURE__*/React.createElement(InfoOutlineIcon, null),
    success: /*#__PURE__*/React.createElement(DoneOutlineIcon, null)
  };
  return converter[variant];
};
const StickyBanner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    title,
    description,
    variant = 'info',
    open = true,
    withIcon = false,
    withCloseButton = false,
    onOpenChange,
    actions,
    className,
    children,
    ...restProps
  } = props;
  if (!open) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: cn(className, styles['mtsds-sticky-banner'], styles[`mtsds-sticky-banner--variant--${variant}`], !!description && styles['mtsds-sticky-banner__content--has--description'])
    /* eslint-disable-next-line react/jsx-props-no-spreading */,
    ...restProps
  }, /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-sticky-banner__content--inner']
  }, withIcon && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-sticky-banner__icon']
  }, convertIconVariant(variant)), /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-sticky-banner__content']
  }, /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-sticky-banner__content--title']
  }, title), description && /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-sticky-banner__content--description']
  }, description))), (actions || withCloseButton && onOpenChange) && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-sticky-banner__actions']
  }, actions, withCloseButton && onOpenChange && /*#__PURE__*/React.createElement(CloseButton, {
    variant: "ghost",
    size: 32,
    onClick: () => onOpenChange(false)
  })));
});

export { StickyBanner };
