'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import cn from 'clsx';
import { Tooltip } from '@mts-ds/granat2-react-tooltip/severed';
import { Badge } from '@mts-ds/granat2-react-badge/severed';
import styles from './label.module.scss.js';
import { InfoIcon } from './assets/info.js';
import { LockIcon } from './assets/lock.js';

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
// eslint-disable-next-line react/function-component-definition
const Label = (props, ref) => {
  const {
    size = 'm',
    disabled,
    invalid,
    hint,
    required,
    floating,
    className,
    children,
    contextBackgroundColor = 'primary',
    htmlFor,
    ...restProps
  } = props;
  const isDisabled = Boolean(disabled);
  const visibleRequiredAsterisk = required === 'asterisk' && !isDisabled;
  const visibleOptionalBadge = required === false && !isDisabled;
  const visibleHint = Boolean(hint);
  return /*#__PURE__*/React.createElement("label", {
    ref: ref,
    htmlFor: htmlFor,
    className: cn(styles['mtsds-label'], styles[`mtsds-label--size--${size}`], className, invalid && styles['mtsds-label--invalid']),
    ...restProps
  }, /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-label__text']
  }, children), visibleRequiredAsterisk && /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-label--asterisk']
  }, "*"), visibleHint && /*#__PURE__*/React.createElement(Tooltip, {
    text: hint
  }, /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-label--icon'],
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(InfoIcon, null))), isDisabled && /*#__PURE__*/React.createElement("span", {
    className: styles['mtsds-label--icon'],
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(LockIcon, null)), visibleOptionalBadge && /*#__PURE__*/React.createElement("span", {
    className: cn(styles['mtsds-label--badge'], styles[`mtsds-label--badge--${contextBackgroundColor}`]),
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement(Badge, {
    size: 16,
    textColor: "badge--color",
    backgroundColor: "badge--background"
  }, "\u041D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E")));
};
const componentWithRef = /*#__PURE__*/forwardRef(Label);

export { componentWithRef as Label };
