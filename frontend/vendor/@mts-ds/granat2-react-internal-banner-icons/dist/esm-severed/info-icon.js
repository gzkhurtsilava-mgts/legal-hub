'use client';
import * as React from 'react';
import SvgInfo from './granat2/src/components/banner-secondary/assets/info.svg.js';

function InfoIcon({
  inverted
}) {
  return /*#__PURE__*/React.createElement(SvgInfo, {
    fill: inverted ? 'var(--color-accent-active-inverted)' : 'var(--color-accent-active)'
  });
}

export { InfoIcon };
