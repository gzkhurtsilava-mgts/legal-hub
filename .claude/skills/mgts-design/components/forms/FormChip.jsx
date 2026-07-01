import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS FormChip — input token chip for multi-value fields (recipients, tags).
 * Outlined pill with optional leading avatar/icon and a remove (×).
 */
export function FormChip({ children, icon, onRemove, invalid = false, disabled = false, style, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 6px 0 12px',
      borderRadius: 'var(--radius-s)',
      background: 'var(--color-background-primary)',
      border: `1px solid ${invalid ? 'var(--color-accent-negative)' : 'var(--color-control-stroke)'}`,
      color: disabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
      fontFamily: 'var(--font-compact)', fontSize: 14, whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {icon && <Icon name={icon} size={16} style={{ color: 'var(--color-icons-secondary)', marginLeft: -4 }} />}
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} disabled={disabled}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, border: 'none', background: 'transparent', borderRadius: 'var(--radius-s)',
            cursor: disabled ? 'not-allowed' : 'pointer', padding: 0 }}>
          <Icon name="CrossSize16StyleOutline" size={16} style={{ color: 'var(--color-icons-secondary)' }} />
        </button>
      )}
    </span>
  );
}

export default FormChip;
