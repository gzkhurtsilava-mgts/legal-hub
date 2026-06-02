'use client';
import * as React from 'react';
import { forwardRef, useContext, useCallback } from 'react';
import cn from 'clsx';
import SvgCheck24 from '../granat2/src/components/droplist-cell/assets/check-24.svg.js';
import { DroplistContext } from '../context/droplist-context.js';
import styles from './droplist-cell.module.scss.js';

const Cell = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    text,
    onClick,
    selected,
    caption,
    className,
    key,
    ...rest
  } = props;
  const {
    size = 44,
    onCellClick
  } = useContext(DroplistContext);
  const handleClick = useCallback(itemKey => {
    onCellClick?.(itemKey);
    onClick?.(itemKey);
  }, [onCellClick, onClick]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    React.createElement("li", {
      ...rest,
      className: cn(className, styles['mtsds-droplist-cell'], styles[`mtsds-droplist-cell--size--${size}`], selected && styles['mtsds-droplist-cell--selected']),
      onClick: () => handleClick(key),
      role: "option",
      tabIndex: -1,
      "aria-selected": selected,
      ref: ref
    }, /*#__PURE__*/React.createElement("label", {
      className: cn(styles['mtsds-droplist-cell__label']),
      "aria-hidden": true
    }, /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-droplist-cell__text'])
    }, /*#__PURE__*/React.createElement("span", {
      className: cn(styles['mtsds-droplist-cell__title'])
    }, text), caption && /*#__PURE__*/React.createElement("span", {
      className: cn(styles['mtsds-droplist-cell__caption'])
    }, caption)), /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-droplist-cell__check-icon'])
    }, /*#__PURE__*/React.createElement(SvgCheck24, null))))
  );
});

export { Cell };
