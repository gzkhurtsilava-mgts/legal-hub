'use client';
import * as React from 'react';
import { ButtonIcon } from '@mts-ds/granat2-react-button';
import SvgCross from '../packages/granat2/src/components/banner-primary/stories/assets/cross.svg.js';

function CloseButton({
  ...props
}) {
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement(ButtonIcon, {
      "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      type: "button",
      ...props
    }, /*#__PURE__*/React.createElement(SvgCross, null))
  );
}

export { CloseButton };
