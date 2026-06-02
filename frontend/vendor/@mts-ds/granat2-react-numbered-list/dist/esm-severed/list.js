'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './list.module.scss.js';

const List = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    device = 'desktop',
    gap,
    className,
    style,
    //
    ...rest
  } = props;
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    React.createElement("ol", {
      ...rest,
      ref: ref,
      role: "list",
      className: clsx(styles['mtsds-numbered-list'], styles[`mtsds-numbered-list--device--${device}`], className),
      style: {
        ...style,
        ...(gap ? {
          '--mtsds-numbered-list---gap': gap
        } : {})
      }
    }, children)
  );
});

export { List };
