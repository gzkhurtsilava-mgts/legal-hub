import React from 'react';

/**
 * MGTS Divider — hairline separator. Horizontal (default) or vertical.
 * Optional centered label text for horizontal dividers.
 */
export function Divider({ orientation = 'horizontal', label, spacing = 16, style, ...rest }) {
  if (orientation === 'vertical') {
    return <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-line)', margin: `0 ${spacing}px`, ...style }} {...rest} />;
  }
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: `${spacing}px 0`, ...style }} {...rest}>
        <div style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
        <span style={{ fontFamily: 'var(--font-compact)', fontSize: 13, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--color-line)' }} />
      </div>
    );
  }
  return <div style={{ height: 1, background: 'var(--color-line)', margin: `${spacing}px 0`, ...style }} {...rest} />;
}

export default Divider;
