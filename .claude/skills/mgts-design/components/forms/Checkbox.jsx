import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/** MGTS Checkbox — checked state uses МГТС blue. radius-s box. */
export function Checkbox({ checked = false, onChange, label, disabled = false, style, ...rest }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--font-compact)', fontSize: 15,
      color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
      ...style,
    }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, flexShrink: 0,
          borderRadius: 'var(--radius-s)',
          background: checked ? (disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)') : 'transparent',
          border: checked ? '1px solid transparent' : `1px solid ${disabled ? 'var(--color-line)' : 'var(--color-control-stroke)'}`,
          transition: 'all var(--duration-fast) var(--ease-standard)',
        }}
      >
        {checked && <Icon name="CheckSize16StyleOutline" size={16} style={{ color: '#fff' }} />}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Checkbox;
