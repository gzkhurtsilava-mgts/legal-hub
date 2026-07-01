import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Tag — compact removable chip. radius-s.
 * Optional icon and remove (×) affordance.
 */
export function Tag({ children, icon, onRemove, selected = false, style, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 28, padding: '0 10px', borderRadius: 'var(--radius-s)',
      background: selected ? 'var(--color-brand-subtle)' : 'var(--color-background-secondary)',
      color: selected ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
      border: selected ? '1px solid var(--color-brand)' : '1px solid transparent',
      fontFamily: 'var(--font-compact)', fontSize: 14, whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {icon && <Icon name={icon} size={16} style={{ color: 'var(--color-icons-secondary)' }} />}
      {children}
      {onRemove && (
        <span onClick={onRemove} style={{ display: 'inline-flex', cursor: 'pointer', marginLeft: 2 }}>
          <Icon name="CrossSize16StyleOutline" size={16} style={{ color: 'var(--color-icons-secondary)' }} />
        </span>
      )}
    </span>
  );
}

export default Tag;
