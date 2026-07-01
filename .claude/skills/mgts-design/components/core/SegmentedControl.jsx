import React from 'react';

/**
 * MGTS SegmentedControl — mutually-exclusive segment switch.
 * Granat pattern: grey track, active segment is a white pill with shadow.
 * segments: [{ value, label }] or string[].
 */
export function SegmentedControl({ segments = [], value, onChange, size = 'm', fullWidth = false, style, ...rest }) {
  const heights = { s: 36, m: 44 };
  const pad = { s: 3, m: 4 };
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: pad[size],
      background: 'var(--color-background-secondary)',
      borderRadius: 'var(--radius-m)', width: fullWidth ? '100%' : 'auto',
      ...style,
    }} {...rest}>
      {segments.map((s) => {
        const val = s.value ?? s;
        const lbl = s.label ?? s;
        const active = val === value;
        return (
          <button
            key={val} type="button" onClick={() => onChange && onChange(val)}
            style={{
              flex: fullWidth ? 1 : 'none',
              height: heights[size] - pad[size] * 2, padding: '0 16px',
              border: 'none', borderRadius: 'calc(var(--radius-m) - 3px)',
              background: active ? 'var(--color-background-primary)' : 'transparent',
              boxShadow: active ? 'var(--shadow-low)' : 'none',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-compact)', fontSize: 14,
              fontWeight: active ? 'var(--fw-medium)' : 'var(--fw-regular)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
