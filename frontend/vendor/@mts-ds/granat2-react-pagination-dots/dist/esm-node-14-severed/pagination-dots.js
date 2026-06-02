import * as React from 'react';
import { forwardRef } from 'react';
import classNames from 'clsx';
import styles from './pagination-dots.module.scss.js';

const PaginationDots = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    contextBackground = 'primary',
    children,
    className,
    ...rest
  } = props;
  const blockStyles = classNames(styles[`mtsds-pagination`], contextBackground === 'alternative' && styles[`mtsds-pagination--alternative`]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      ref: ref,
      className: classNames(className, blockStyles)
    }, children)
  );
});

export { PaginationDots };
