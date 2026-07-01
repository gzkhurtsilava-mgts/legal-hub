import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS StickyBanner — full-width sticky info/promo strip.
 * tone: brand (blue) | info | warning | neutral. Optional icon, action, close.
 */
export function StickyBanner({ tone = 'brand', message, icon, actionLabel, onAction, onClose, style, ...rest }) {
  const map = {
    brand:   { bg: 'var(--color-brand)', fg: '#fff', sub: 'rgba(255,255,255,0.85)', actionFg: '#fff' },
    info:    { bg: 'var(--color-accent-brand-bg)', fg: 'var(--color-text-primary)', sub: 'var(--color-text-secondary)', actionFg: 'var(--color-text-brand)' },
    warning: { bg: 'var(--color-accent-warning-bg)', fg: 'var(--color-text-primary)', sub: 'var(--color-text-secondary)', actionFg: '#9a7000' },
    neutral: { bg: 'var(--color-background-inverted)', fg: 'var(--color-text-inverted)', sub: 'var(--granat-grey-400)', actionFg: 'var(--mgts-blue-300)' },
  }[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 24px',
      background: map.bg, color: map.fg, fontFamily: 'var(--font-compact)', fontSize: 14, ...style,
    }} {...rest}>
      {icon && <Icon name={icon} size={24} style={{ color: map.fg, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{message}</span>
      {actionLabel && (
        <button type="button" onClick={onAction} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-compact)', fontSize: 14, fontWeight: 'var(--fw-medium)',
          color: map.actionFg, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>{actionLabel}</button>
      )}
      {onClose && (
        <span onClick={onClose} style={{ cursor: 'pointer', flexShrink: 0, display: 'inline-flex', opacity: 0.8 }}>
          <Icon name="CrossSize24StyleOutline" size={24} style={{ color: map.fg }} />
        </span>
      )}
    </div>
  );
}

export default StickyBanner;
