'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import classNames from 'clsx';
import { paramCase } from 'param-case';
import styles from './badge.module.scss.js';

/**
 * Компонент Badge
 */
const Badge = /*#__PURE__*/forwardRef(({
  size,
  backgroundColor = '',
  textColor = 'primary',
  children
}, ref) => {
  const {
    textChildren,
    iconChildren
  } = useMemo(() => {
    let innerTextChildren;
    let innerIconChildren;
    const arrayChildren = React.Children.toArray(children);
    arrayChildren.forEach(ch => {
      if (typeof ch === 'string') {
        innerTextChildren = ch;
        return;
      }
      if (ch.type.name === 'MtsDsBadgeIcon') {
        innerIconChildren = ch;
      }
    });
    return {
      textChildren: innerTextChildren,
      iconChildren: innerIconChildren
    };
  }, [children]);
  const backgroundColorVariable = useMemo(() => ({
    '--mtsds-badge--background-color': `var(--${paramCase(backgroundColor)})`
  }), [backgroundColor]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: classNames(styles['mtsds-badge'], styles[`mtsds-badge--size--${size}`], !!textColor && styles[`mtsds-badge--text-color--${textColor}`]),
    style: backgroundColor && backgroundColorVariable || {}
  }, iconChildren, /*#__PURE__*/React.createElement("p", {
    className: styles['mtsds-badge__text']
  }, textChildren));
});
Badge.defaultProps = {
  size: 'm',
  backgroundColor: '',
  textColor: 'primary'
};

export { Badge, Badge as MtsDsBadge };
