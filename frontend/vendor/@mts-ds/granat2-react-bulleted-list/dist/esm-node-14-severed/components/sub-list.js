'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './sub-list.module.scss.js';

const SubList = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    className,
    //
    ...rest
  } = props;
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/no-redundant-roles,react/jsx-props-no-spreading
    React.createElement("ul", {
      ...rest,
      ref: ref,
      className: clsx(styles['mtsds-bulleted-list__sublist'], className),
      role: "list"
    }, children)
  );
});

export { SubList };
