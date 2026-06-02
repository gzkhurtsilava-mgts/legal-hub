import * as React from 'react';
import { forwardRef } from 'react';
import classNames from 'clsx';
import styles from './pagination-dots.module.scss.js';

const Dot = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    isActive = false,
    className,
    ...rest
  } = props;
  const dotStyles = classNames(className, styles['mtsds-pagination__dot'], isActive && styles['mtsds-pagination__dot--active']);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    ...rest,
    className: dotStyles
  });
});

export { Dot };
