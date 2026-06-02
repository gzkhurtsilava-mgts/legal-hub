'use client';
import * as React from 'react';
import SvgError from './packages/granat2/src/components/banner-secondary/assets/error.svg.js';

function ErrorIcon({
  inverted
}) {
  return /*#__PURE__*/React.createElement(SvgError, {
    fill: inverted ? 'var(--color-accent-negative-inverted)' : 'var(--color-accent-negative)'
  });
}

export { ErrorIcon };
