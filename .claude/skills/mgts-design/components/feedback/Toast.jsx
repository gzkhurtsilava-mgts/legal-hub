import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Toast — inline notification. tone sets the leading icon + accent.
 * tone: info (brand) | positive | warning | negative
 */
export function Toast({ tone = 'info', title, description, onClose, style, ...rest }) {
  const map = {
    info:     { icon: 'InformationSize24StyleOutline', color: 'var(--color-brand)' },
    positive: { icon: 'CheckSize24StyleOutline', color: 'var(--color-accent-positive)' },
    warning:  { icon: 'InformationSize24StyleOutline', color: 'var(--color-accent-warning)' },
    negative: { icon: 'CrossCircleSize24StyleOutline', color: 'var(--color-accent-negative)' },
  }[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      maxWidth: 420, padding: 16,
      background: 'var(--color-background-primary)',
      border: '1px solid var(--color-line)',
      borderRadius: 'var(--radius-m)', boxShadow: 'var(--shadow-middle)',
      fontFamily: 'var(--font-compact)', ...style,
    }} {...rest}>
      <Icon name={map.icon} size={24} style={{ color: map.color, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)' }}>{title}</div>}
        {description && <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: title ? 2 : 0 }}>{description}</div>}
      </div>
      {onClose && (
        <span onClick={onClose} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="CrossSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)' }} />
        </span>
      )}
    </div>
  );
}

export default Toast;
