import React from 'react';

/** MGTS Switch / toggle — on state uses МГТС blue track. */
export function Switch({ checked = false, onChange, label, disabled = false, style, ...rest }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-compact)', fontSize: 15,
      color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
      ...style,
    }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          position: 'relative', width: 44, height: 24, flexShrink: 0,
          borderRadius: 'var(--radius-xl)',
          background: checked
            ? (disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)')
            : 'var(--granat-grey-200)',
          transition: 'background var(--duration-base) var(--ease-standard)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(29,32,35,0.24)',
          transition: 'left var(--duration-base) var(--ease-standard)',
        }} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Switch;
