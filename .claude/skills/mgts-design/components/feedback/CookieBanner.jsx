import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS CookieBanner — bottom cookie-consent bar.
 * Light card with shadow, message + accept/settings actions.
 */
export function CookieBanner({
  title = 'Мы используем cookie',
  message = 'Продолжая пользоваться сайтом, вы соглашаетесь с использованием файлов cookie.',
  acceptLabel = 'Принять',
  settingsLabel = 'Настроить',
  onAccept, onSettings, onClose, style, ...rest
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20, maxWidth: 920, padding: 20,
      background: 'var(--color-background-primary)', borderRadius: 'var(--radius-l)',
      boxShadow: 'var(--shadow-high)', fontFamily: 'var(--font-compact)', ...style,
    }} {...rest}>
      <Icon name="InformationSize32StyleOutline" size={32} style={{ color: 'var(--color-icons-brand)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>{message}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        {onSettings && (
          <button type="button" onClick={onSettings} style={{
            height: 44, padding: '0 20px', border: '1px solid var(--color-brand)', borderRadius: 'var(--radius-m)',
            background: 'transparent', color: 'var(--color-text-brand)', cursor: 'pointer',
            fontFamily: 'var(--font-compact)', fontSize: 15, fontWeight: 'var(--fw-medium)' }}>{settingsLabel}</button>
        )}
        <button type="button" onClick={onAccept} style={{
          height: 44, padding: '0 20px', border: 'none', borderRadius: 'var(--radius-m)',
          background: 'var(--color-brand)', color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-compact)', fontSize: 15, fontWeight: 'var(--fw-medium)' }}>{acceptLabel}</button>
      </div>
    </div>
  );
}

export default CookieBanner;
