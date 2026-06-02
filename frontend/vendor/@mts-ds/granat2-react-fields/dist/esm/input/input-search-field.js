'use client';
import * as React from 'react';
import { forwardRef } from 'react';
import { InputBase as componentWithRef$1 } from './input-base.js';
import { SearchIcon } from './assets/search.js';

// eslint-disable-next-line react/function-component-definition
const InputSearchField = (props, ref) => {
  const {
    type = 'search',
    size,
    slotStart = /*#__PURE__*/React.createElement(SearchIcon, null),
    hideValidationIcon = true,
    ...restProps
  } = props;
  return /*#__PURE__*/React.createElement(componentWithRef$1, {
    ref: ref,
    type: type,
    size: size,
    hideValidationIcon: hideValidationIcon,
    slotStart: slotStart
    // eslint-disable-next-line react/jsx-props-no-spreading
    ,
    ...restProps
  });
};
const componentWithRef = /*#__PURE__*/forwardRef(InputSearchField);

export { componentWithRef as InputSearchField };
