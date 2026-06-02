'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import classNames from 'clsx';
import { Text } from '@mts-ds/granat2-react-internal-text';
import styles from './badge.module.scss.js';

const BadgeIcon = ({
  icon,
  color
}) => {
  const iconFillStyle = {
    '--mtsds-svg--fill': `var(--color-${color})`
  };
  const blockClass = classNames(styles['mtsds-icon'], styles['mtsds-svg'], styles['mtsds-badge__icon']);
  return /*#__PURE__*/React.cloneElement(icon, {
    className: classNames(blockClass),
    style: iconFillStyle
  });
};

/**
 * Компонент Badge
 */

const Badge = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size = 24,
    backgroundColor,
    textColor = 'text-primary',
    icon,
    iconColor,
    className,
    style,
    children,
    ...rest
  } = props;
  const backgroundColorVariable = useMemo(() => {
    if (backgroundColor) return {
      '--mtsds-badge--background-color': `var(--color-${backgroundColor})`,
      ...style
    };
    return {
      ...style
    };
  }, [backgroundColor, style]);
  const blockStyles = classNames(styles['mtsds-badge'], size && styles[`mtsds-badge--size--${size}`]);
  const font = useMemo(() => {
    const fontSize = {
      16: 'c1-medium-comp',
      20: 'c1-medium-comp',
      24: 'p4-medium-comp',
      32: 'p3-medium-comp'
    };
    return `${fontSize[size]}`;
  }, [size]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("span", {
      ...rest,
      ref: ref,
      className: classNames(blockStyles, className),
      style: backgroundColorVariable
    }, size !== 16 && icon && /*#__PURE__*/React.createElement(BadgeIcon, {
      icon: icon,
      color: iconColor || textColor
    }), /*#__PURE__*/React.createElement(Text, {
      font: font,
      color: textColor,
      className: styles['mtsds-badge__text']
    }, children))
  );
});

export { Badge };
