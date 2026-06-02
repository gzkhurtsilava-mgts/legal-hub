'use client';
import * as React from 'react';
import { forwardRef, useState, useEffect, useMemo } from 'react';
import cn from 'clsx';
import { mergeRefs } from '@mts-ds/react-utils';
import { useFloating, offset, flip, autoUpdate, useInteractions, useClick, useDismiss, useRole } from '@floating-ui/react';
import styles from './droplist.module.scss.js';
import { DroplistProvider } from './context/droplist-context.js';

const Droplist = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size,
    children,
    onCellClick,
    className,
    anchorRef,
    open = false,
    style,
    ...rest
  } = props;
  const [isOpen, setIsOpen] = useState(open);
  const [droplistWidth, setWidth] = useState(style?.width);
  useEffect(() => {
    setWidth(style?.width);
  }, [style?.width]);
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  const {
    context,
    refs,
    floatingStyles
  } = useFloating({
    open: isOpen,
    placement: 'bottom-start',
    elements: {
      reference: anchorRef?.current
    },
    middleware: [offset(4), flip()],
    whileElementsMounted: autoUpdate
  });
  const {
    getFloatingProps
  } = useInteractions([useClick(context), useDismiss(context), useRole(context)]);
  useEffect(() => {
    if (style?.width) {
      return;
    }
    if (context?.elements?.reference) {
      const {
        width: refWidth
      } = context.elements.reference.getBoundingClientRect();
      setWidth(refWidth);
    }
  }, [context?.elements?.reference, style?.width]);
  const mergeRef = useMemo(() => mergeRefs(refs.setFloating, ref), [refs.setFloating, ref]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-no-useless-fragment
    React.createElement(React.Fragment, null, isOpen && /*#__PURE__*/React.createElement(DroplistProvider, {
      size: size,
      onCellClick: onCellClick
    }, /*#__PURE__*/React.createElement("div", {
      ...rest,
      className: cn(className, styles['mtsds-droplist'])
      // eslint-disable-next-line react/jsx-props-no-spreading
      ,
      ...getFloatingProps({
        ref: mergeRef,
        style: {
          width: droplistWidth,
          ...floatingStyles,
          ...style
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: cn(styles['mtsds-droplist__wrapper']),
      role: "listbox"
    }, /*#__PURE__*/React.createElement("ul", {
      className: cn(styles['mtsds-droplist__list']),
      role: "list"
    }, children)))))
  );
});

export { Droplist };
