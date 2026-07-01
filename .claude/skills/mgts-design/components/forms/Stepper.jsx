import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Stepper — numeric input with − / + controls.
 * Brand-tinted buttons; respects min/max/step.
 */
export function Stepper({ value = 0, onChange, min = 0, max = 99, step = 1, disabled = false, size = 'm', style, ...rest }) {
  const heights = { s: 36, m: 44 };
  const set = (v) => { if (!disabled) onChange && onChange(Math.max(min, Math.min(max, v))); };
  const btn = (dir, icon, off) => (
    <button
      type="button" disabled={disabled || off} onClick={() => set(value + dir * step)}
      style={{
        width: heights[size], height: heights[size], flexShrink: 0, border: 'none',
        background: 'transparent', cursor: disabled || off ? 'not-allowed' : 'pointer',
        color: disabled || off ? 'var(--color-text-tertiary)' : 'var(--color-text-brand)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={24} />
    </button>
  );
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', height: heights[size],
      border: '1px solid var(--color-control-stroke)', borderRadius: 'var(--radius-m)',
      background: 'var(--color-background-primary)', ...style,
    }} {...rest}>
      {btn(-1, 'MinusSize24StyleOutline', value <= min)}
      <span style={{
        minWidth: 36, textAlign: 'center', fontFamily: 'var(--font-compact)',
        fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)',
      }}>{value}</span>
      {btn(1, 'PlusSize24StyleOutline', value >= max)}
    </div>
  );
}

export default Stepper;
