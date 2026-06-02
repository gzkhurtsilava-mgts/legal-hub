'use client';
import * as React from 'react';
import { forwardRef, useMemo, Children } from 'react';
import clsx from 'clsx';
import styles from './item.module.scss.js';

const ListItem = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    title,
    subTitle,
    children,
    ariaLevel = 2,
    className,
    //
    ...rest
  } = props;
  const isText = useMemo(() => {
    let res = false;
    const child = Children.toArray(children);
    if (child.length === 1 && typeof child[0] === 'string') {
      res = true;
    }
    return res;
  }, [children]);
  return /*#__PURE__*/React.createElement("li", {
    ...rest,
    ref: ref,
    className: clsx(styles['mtsds-numbered-list__item'], className, title && styles['mtsds-numbered-list__item--has--title'])
  }, title && /*#__PURE__*/React.createElement("div", {
    role: "heading",
    "aria-level": ariaLevel,
    className: styles['mtsds-numbered-list__item-title']
  }, title), subTitle && /*#__PURE__*/React.createElement("div", {
    className: styles['mtsds-numbered-list__item-subtitle']
  }, subTitle), isText && /*#__PURE__*/React.createElement("div", {
    role: "heading",
    "aria-level": ariaLevel,
    className: styles['mtsds-numbered-list__item-text']
  }, children), !isText && children);
});

export { ListItem };
