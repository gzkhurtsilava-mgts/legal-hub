'use client';
import * as React from 'react';
import { forwardRef, useState, useMemo, useEffect, cloneElement } from 'react';
import { getScrollParentElement, mergeRefs } from '@mts-ds/react-utils';
import { useFloating, offset, flip, hide, autoUpdate, useHover, useFocus, useClick, useInteractions, useRole, useDismiss } from '@floating-ui/react';
import cn from 'clsx';
import { placementDecorator, shiftPopper } from './utils/helpers.js';
import styles from './tooltip.module.scss.js';

const Tooltip = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    text = '',
    placement = 'top',
    initialOpen = false,
    open,
    onOpenChange,
    preferPositions = [],
    children,
    zIndex = 1,
    position = 'fixed',
    hideTooltip = true,
    trigger = 'hover',
    className,
    ...rest
  } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [scrollContainer, setScrollContainer] = useState();
  const showTooltip = open || uncontrolledOpen;
  const setShowTooltip = open ? onOpenChange : setUncontrolledOpen;
  const {
    context,
    refs,
    middlewareData,
    floatingStyles
  } = useFloating({
    open: showTooltip,
    strategy: position,
    middleware: [offset(13), flip({
      boundary: scrollContainer,
      fallbackPlacements: placementDecorator([placement, ...(preferPositions || [])])
    }), hide()],
    placement,
    onOpenChange: setShowTooltip,
    whileElementsMounted: autoUpdate
  });
  const hover = useHover(context, {
    enabled: trigger === 'hover'
  });
  const focus = useFocus(context, {
    enabled: trigger === 'focus'
  });
  const click = useClick(context, {
    enabled: trigger === 'click'
  });
  const triggerMode = useMemo(() => {
    switch (trigger) {
      case 'click':
        return click;
      case 'focus':
        return focus;
      default:
        return hover;
    }
  }, [trigger, click, focus, hover]);
  const {
    getReferenceProps,
    getFloatingProps
  } = useInteractions([triggerMode, useRole(context, {
    role: 'tooltip'
  }), useDismiss(context)]);
  useEffect(() => {
    if (context?.elements?.reference) {
      const {
        width,
        height
      } = context.elements.reference.getBoundingClientRect();
      shiftPopper(height, width, context.placement, context.elements.floating);
    }
  }, [context?.elements?.reference, context?.elements?.floating, context?.placement]);
  useEffect(() => {
    const el = getScrollParentElement(context.elements.reference?.parentElement || null);
    if (el) setScrollContainer(el);
  }, [context.elements.reference]);
  useEffect(() => {
    if (context.elements.floating && middlewareData.hide?.referenceHidden && hideTooltip) {
      context.elements.floating.style.visibility = 'hidden';
    }
    return () => {
      if (context.elements.floating) context.elements.floating.style.visibility = 'visible';
    };
  }, [context.elements.floating, hideTooltip, middlewareData.hide?.referenceHidden]);
  const popperPlacement = useMemo(() => {
    const basePopperPlacement = context?.placement.split('-')[0];
    return basePopperPlacement;
  }, [context?.placement]);
  const alignment = useMemo(() => {
    const tooltipPlacement = context?.placement;
    switch (tooltipPlacement) {
      case 'top-start':
      case 'bottom-start':
        return 'left';
      case 'top-end':
      case 'bottom-end':
        return 'right';
      case 'left-start':
      case 'right-start':
        return 'top';
      case 'left-end':
      case 'right-end':
        return 'bottom';
      default:
        return null;
    }
  }, [context?.placement]);
  const mergeRef = useMemo(() => mergeRefs(refs.setFloating, ref), [refs.setFloating, ref]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/cloneElement(children, getReferenceProps({
    ref: refs.setReference,
    ...children.props
  })), showTooltip && /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(styles['mtsds-tooltip'], styles[`mtsds-tooltip--placement--${popperPlacement}`], className, alignment && styles[`mtsds-tooltip--alignment--${alignment}`])
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...getFloatingProps({
      ref: mergeRef,
      style: {
        position,
        zIndex,
        ...floatingStyles
      }
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-tooltip__text'])
  }, text)));
});

export { Tooltip };
