'use client';
import * as React from 'react';
import { forwardRef, useMemo } from 'react';
import { useTextClass } from './hooks/text-class.js';

const Text = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    truncate,
    font,
    color,
    as,
    className,
    style,
    ...rest
  } = props;
  const Tag = as || 'span';
  const colorVariable = useMemo(() => {
    if (color) return {
      '--mtsds-text--color': `var(--color-${color})`,
      ...style
    };
    return {
      ...style
    };
  }, [color, style]);
  return /*#__PURE__*/React.createElement(Tag, {
    style: colorVariable,
    className: useTextClass({
      font,
      truncate,
      className
    })
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...rest,
    ref: ref
  }, children);
});

export { Text };
