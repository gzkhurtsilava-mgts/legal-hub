'use client';
import * as React from 'react';
import { forwardRef, useMemo, Children, cloneElement } from 'react';
import cn from 'clsx';
import styles from './breadcrumb.module.scss.js';

const Breadcrumb = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size = 24,
    children,
    className,
    ...rest
  } = props;
  const renderChildren = useMemo(() => {
    const childrenArr = Children.toArray(children);
    return Children.map(childrenArr, (child, idx) => /*#__PURE__*/cloneElement(child, {
      active: childrenArr.length > 1 && idx === childrenArr.length - 1,
      metaContent: idx + 1,
      size,
      oneLine: childrenArr.length === 1
    }));
  }, [children, size]);
  return /*#__PURE__*/React.createElement("ol", {
    ...rest,
    className: cn(className, styles['mtsds-breadcrumb'], styles[`mtsds-breadcrumb--size--${size}`]),
    itemScope: true,
    itemType: "https://schema.org/BreadcrumbList",
    ref: ref
  }, renderChildren);
});

export { Breadcrumb };
