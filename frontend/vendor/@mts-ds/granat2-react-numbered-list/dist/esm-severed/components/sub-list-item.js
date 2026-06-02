'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './sub-list.module.scss.js';

const SubListItem = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    className,
    //
    ...rest
  } = props;
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("li", {
      ...rest,
      ref: ref,
      className: clsx(styles['mtsds-numbered-list__sublist-item'], className)
    }, children)
  );
});

export { SubListItem };
