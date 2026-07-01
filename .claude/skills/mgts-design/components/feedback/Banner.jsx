import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Banner — full-width inline message block. radius-l.
 * tone: info (brand) | positive | warning | negative | neutral.
 * Soft tonal background, leading icon, title + description, optional action.
 */
export function Banner({ tone = 'info', title, description, icon, action, onClose, style, ...rest }) {
  const map = {
    info:     { bg: 'var(--color-accent-brand-bg)', accent: 'var(--color-brand)', icon: icon || 'InformationSize24StyleOutline' },
    positive: { bg: 'var(--color-accent-positive-bg)', accent: 'var(--color-accent-positive)', icon: icon || 'CheckSize24StyleOutline' },
    warning:  { bg: 'var(--color-accent-warning-bg)', accent: 'var(--color-accent-warning)', icon: icon || 'InformationSize24StyleOutline' },
    negative: { bg: 'var(--color-accent-negative-bg)', accent: 'var(--color-accent-negative)', icon: icon || 'CrossCircleSize24StyleOutline' },
    neutral:  { bg: 'var(--color-background-secondary)', accent: 'var(--color-icons-secondary)', icon: icon || 'InformationSize24StyleOutline' },
  }[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
      background: map.bg, borderRadius: 'var(--radius-l)', fontFamily: 'var(--font-compact)', ...style,
    }} {...rest}>
      <Icon name={map.icon} size={24} style={{ color: map.accent, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)' }}>{title}</div>}
        {description && <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: title ? 2 : 0 }}>{description}</div>}
        {action && <div style={{ marginTop: 12 }}>{action}</div>}
      </div>
      {onClose && (
        <span onClick={onClose} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="CrossSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)' }} />
        </span>
      )}
    </div>
  );
}

export default Banner;
