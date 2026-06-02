'use client';
import * as React from 'react';
import { forwardRef, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { mergeRefs } from '@mts-ds/react-utils';
import cn from 'clsx';
import styles from '../segmented-control.module.scss.js';
import { SegmentedControlContext } from '../context/segmented-context.js';

const Item = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    active,
    disabled,
    icon,
    name,
    id,
    onChange,
    className,
    ...rest
  } = props;
  const {
    setOffset,
    size
  } = useContext(SegmentedControlContext);
  const componentRef = useRef(null);
  const [elOffset, setElOffset] = useState({
    width: 0,
    left: 0
  });
  const handleSize = useCallback(() => {
    setElOffset({
      width: disabled ? 0 : componentRef?.current?.offsetWidth || 0,
      left: componentRef?.current?.offsetLeft || 0
    });
  }, [disabled]);
  useEffect(() => {
    if (active) {
      handleSize();
    }
  }, [active, handleSize]);
  useEffect(() => {
    if (active) {
      setOffset(elOffset);
    }
  }, [active, elOffset, setOffset]);
  useEffect(() => {
    handleSize();
  }, [handleSize, size]);
  const modifiedIcon = useMemo(() => icon && /*#__PURE__*/React.cloneElement(icon, {
    className: cn(styles['mtsds-segmented-control__icon'])
  }), [icon]);
  const mergeRef = useMemo(() => mergeRefs(componentRef, ref), [componentRef, ref]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    React.createElement("label", {
      ...rest,
      className: cn(className, styles['mtsds-segmented-control__item'], active && [styles[`mtsds-segmented-control__item--active`], disabled && styles[`mtsds-segmented-control__item--disabled-active`]], disabled && styles[`mtsds-segmented-control__item--disabled`]),
      ref: mergeRef
    }, /*#__PURE__*/React.createElement("input", {
      className: cn(styles['mtsds-segmented-control__input']),
      type: "radio",
      id: id,
      name: name,
      onChange: onChange,
      disabled: disabled,
      checked: active
    }), /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-segmented-control__label'])
    }, icon && modifiedIcon, children && /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-segmented-control__text'])
    }, children)))
  );
});

export { Item };
