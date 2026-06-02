'use client';
import * as React from 'react';
import { forwardRef, useContext } from 'react';
import cn from 'clsx';
import { Radio } from '@mts-ds/granat2-react-radio';
import { ControlCell } from './control-cell.js';
import { ControlListSizeContext } from '../context/size-context.js';
import styles from '../control-list.module.scss.js';

const radioSize = {
  s: 16,
  m: 24,
  l: 32
};
const RadioCell = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    label,
    description,
    disabled,
    invalid,
    components,
    className,
    children,
    ...rest
  } = props;
  const {
    size
  } = useContext(ControlListSizeContext);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("li", {
      ...rest,
      className: cn(className, styles['mtsds-control-list__item']),
      ref: ref
    }, /*#__PURE__*/React.createElement(ControlCell
    // eslint-disable-next-line react/jsx-props-no-spreading
    , {
      ...components?.controlCell,
      disabled: disabled,
      invalid: invalid,
      label: label,
      description: description
    }, /*#__PURE__*/React.createElement(Radio, {
      ...components?.radio,
      disabled: disabled,
      invalid: invalid,
      size: radioSize[size]
    })), children)
  );
});

export { RadioCell };
