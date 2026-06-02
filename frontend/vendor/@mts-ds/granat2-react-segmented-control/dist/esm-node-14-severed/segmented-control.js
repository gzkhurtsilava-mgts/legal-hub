'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import { SegmentedControlProvider } from './context/segmented-context.js';
import { SegmentedControlGroup } from './atoms/segmented-control-group.js';

const SegmentedControl = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    size = 44,
    children,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement(SegmentedControlProvider, {
    size: size
  }, /*#__PURE__*/React.createElement(SegmentedControlGroup, {
    ref: ref,
    ...rest
  }, children));
});

export { SegmentedControl };
