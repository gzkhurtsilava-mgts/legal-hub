import React from 'react';

/**
 * MGTS ProgressBar — linear determinate/indeterminate progress.
 * МГТС-blue fill on a grey track. Optional value label.
 */
export function ProgressBar({ value = 0, max = 100, indeterminate = false, showValue = false, tone = 'brand', style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = { brand: 'var(--color-brand)', positive: 'var(--color-accent-positive)', warning: 'var(--color-accent-warning)' }[tone];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }} {...rest}>
      <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'var(--granat-grey-100)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: indeterminate ? '40%' : pct + '%', borderRadius: 3, background: fill,
          animation: indeterminate ? 'mgts-progress 1.2s var(--ease-standard) infinite' : 'none',
          transition: indeterminate ? 'none' : 'width var(--duration-base) var(--ease-standard)',
        }} />
      </div>
      {showValue && !indeterminate && (
        <div style={{ fontFamily: 'var(--font-compact)', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{Math.round(pct)}%</div>
      )}
      <style>{'@keyframes mgts-progress{0%{left:-40%}100%{left:100%}}'}</style>
    </div>
  );
}

export default ProgressBar;
