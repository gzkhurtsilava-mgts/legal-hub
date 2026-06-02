'use client';
import * as React from 'react';
import SvgDone from './packages/granat2/src/components/banner-secondary/assets/done.svg.js';

function DoneIcon({
  inverted
}) {
  return /*#__PURE__*/React.createElement(SvgDone, {
    fill: inverted ? 'var(--color-accent-positive-inverted)' : 'var(--color-accent-positive)'
  });
}

export { DoneIcon };
