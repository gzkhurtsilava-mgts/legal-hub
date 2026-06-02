'use client';
import * as React from 'react';
import SvgWarning from './packages/granat2/src/components/banner-secondary/assets/warning.svg.js';

function WarningIcon({
  inverted
}) {
  return /*#__PURE__*/React.createElement(SvgWarning, {
    fill: inverted ? 'var(--color-accent-warning-inverted)' : 'var(--color-accent-warning)'
  });
}

export { WarningIcon };
