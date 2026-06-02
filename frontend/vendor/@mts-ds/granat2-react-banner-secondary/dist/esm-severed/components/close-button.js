'use client';
import * as React from 'react';
import cn from 'clsx';
import SvgCross from '../granat2/src/components/banner-secondary/assets/cross.svg.js';
import styles from '../banner-secondary.module.scss.js';

function CloseButton({
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: cn(styles['mtsds-banner-secondary__close']),
    type: "button",
    onClick: () => onClick?.()
  }, /*#__PURE__*/React.createElement(SvgCross, null));
}

export { CloseButton };
