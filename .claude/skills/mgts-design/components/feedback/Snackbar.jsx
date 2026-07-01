import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Snackbar — dark inline notification (Granat Toast-Snackbar).
 * Graphite surface, white text, optional action link and close.
 * tone sets the leading-icon accent.
 */
export function Snackbar({ tone = 'neutral', message, actionLabel, onAction, onClose, icon, style, ...rest }) {
  const accent = {
    neutral: '#fff',
    positive: 'var(--color-accent-positive)',
    negative: 'var(--color-accent-negative)',
    warning: 'var(--color-accent-warning)',
  }[tone];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12, maxWidth: 480,
      padding: '12px 16px', background: 'var(--granat-graphite)', color: '#fff',
      borderRadius: 'var(--radius-m)', boxShadow: 'var(--shadow-high)',
      fontFamily: 'var(--font-compact)', fontSize: 14, ...style,
    }} {...rest}>
      {icon && <Icon name={icon} size={24} style={{ color: accent, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{message}</span>
      {actionLabel && (
        <button type="button" onClick={onAction} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-compact)', fontSize: 14, fontWeight: 'var(--fw-medium)',
          color: 'var(--mgts-blue-300)', whiteSpace: 'nowrap',
        }}>{actionLabel}</button>
      )}
      {onClose && (
        <span onClick={onClose} style={{ cursor: 'pointer', flexShrink: 0, display: 'inline-flex' }}>
          <Icon name="CrossSize24StyleOutline" size={24} style={{ color: 'var(--granat-grey-400)' }} />
        </span>
      )}
    </div>
  );
}

export default Snackbar;
