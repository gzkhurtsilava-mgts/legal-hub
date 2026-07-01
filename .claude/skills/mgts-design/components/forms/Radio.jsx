import React from 'react';

/** MGTS Radio — selected dot in МГТС blue. */
export function Radio({ checked = false, onChange, label, disabled = false, name, value, style, ...rest }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-compact)', fontSize: 15,
      color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
      ...style,
    }}>
      <span
        onClick={() => !disabled && onChange && onChange(value ?? true)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, flexShrink: 0, borderRadius: '50%',
          border: `1px solid ${checked ? 'var(--color-brand)' : (disabled ? 'var(--color-line)' : 'var(--color-control-stroke)')}`,
          transition: 'all var(--duration-fast) var(--ease-standard)',
        }}
      >
        {checked && (
          <span style={{ width: 10, height: 10, borderRadius: '50%',
            background: disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)' }} />
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Radio;
