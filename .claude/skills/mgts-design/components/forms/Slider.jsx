import React from 'react';

/**
 * MGTS Slider — single-value range slider. МГТС-blue fill and thumb.
 * Optional value label above the thumb.
 */
export function Slider({ value = 0, onChange, min = 0, max = 100, step = 1, disabled = false, showValue = false, style, ...rest }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', ...style }} {...rest}>
      {showValue && (
        <div style={{ fontFamily: 'var(--font-compact)', fontSize: 14, color: 'var(--color-text-secondary)' }}>{value}</div>
      )}
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: 'var(--granat-grey-100)' }} />
        <div style={{ position: 'absolute', left: 0, width: pct + '%', height: 4, borderRadius: 2,
          background: disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)' }} />
        <input
          type="range" value={value} min={min} max={max} step={step} disabled={disabled}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{ position: 'absolute', left: 0, right: 0, width: '100%', margin: 0,
            WebkitAppearance: 'none', appearance: 'none', background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer', height: 20 }}
        />
        <span style={{
          position: 'absolute', left: `calc(${pct}% - 10px)`, width: 20, height: 20, borderRadius: '50%',
          background: '#fff', border: `2px solid ${disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)'}`,
          boxShadow: 'var(--shadow-low)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

export default Slider;
