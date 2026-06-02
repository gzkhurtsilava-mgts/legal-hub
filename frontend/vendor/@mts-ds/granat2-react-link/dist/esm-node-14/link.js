'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import classNames from 'clsx';
import styles from './link.module.scss.js';

const Icon = ({
  children
}) => {
  const blockClass = classNames(styles['mtsds-icon'], styles['mtsds-svg']);
  return /*#__PURE__*/React.cloneElement(children, {
    className: classNames(blockClass)
  });
};

/**
 * Компонент Link
 */
const Link = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    icon,
    iconPosition = 'end',
    children,
    href,
    size = 16,
    color = 'primary',
    underline = 'none',
    className,
    ...rest
  } = props;
  const blockStyles = classNames(styles['mtsds-link'], icon ? iconPosition === 'begin' && styles[`mtsds-link--reversed`] : underline && styles[`mtsds-link--underline--${underline}`], size && styles[`mtsds-link--size--${size}`], color && styles[`mtsds-link--text-color--${color}`]);
  return /*#__PURE__*/React.createElement("a", {
    ...rest,
    ref: ref,
    href: href
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */,
    className: classNames(className, blockStyles)
  }, /*#__PURE__*/React.createElement("p", {
    className: styles['mtsds-link__text']
  }, children), icon && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-link__icon']
  }, /*#__PURE__*/React.createElement(Icon, null, icon)));
});

export { Link };
