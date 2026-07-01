import React from 'react';

/**
 * MGTS Skeleton — loading placeholder with a subtle shimmer.
 * variant: text | rect | circle. Use width/height to size.
 */
export function Skeleton({ variant = 'rect', width = '100%', height, radius, style, ...rest }) {
  const h = height != null ? height : variant === 'text' ? 14 : variant === 'circle' ? 40 : 80;
  const w = variant === 'circle' ? h : width;
  const r = variant === 'circle' ? '50%' : variant === 'text' ? 4 : (radius != null ? radius : 'var(--radius-m)');
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block', width: w, height: h, borderRadius: r,
        background: 'linear-gradient(90deg, var(--color-background-secondary) 25%, var(--granat-grey-100) 37%, var(--color-background-secondary) 63%)',
        backgroundSize: '400% 100%',
        animation: 'mgts-shimmer 1.4s ease infinite',
        ...style,
      }}
      {...rest}
    >
      <style>{'@keyframes mgts-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}'}</style>
    </span>
  );
}

export default Skeleton;
