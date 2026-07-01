import React from 'react';

/**
 * MGTS Avatar — round user avatar. Image, or initials on brand-subtle.
 * sizes: s(28) m(40) l(56). Optional online status dot.
 */
export function Avatar({ src, name = '', size = 'm', status, style, ...rest }) {
  const px = { s: 28, m: 40, l: 56 }[size];
  const font = { s: 12, m: 15, l: 20 }[size];
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const statusColor = { online: 'var(--color-accent-positive)', busy: 'var(--color-accent-negative)', away: 'var(--color-accent-warning)' }[status];
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: px, height: px, ...style }} {...rest}>
      {src ? (
        <img src={src} alt={name} style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <span style={{
          width: px, height: px, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-brand-subtle)', color: 'var(--color-text-brand)',
          fontFamily: 'var(--font-compact)', fontWeight: 'var(--fw-medium)', fontSize: font,
        }}>{initials || '?'}</span>
      )}
      {status && (
        <span style={{
          position: 'absolute', right: 0, bottom: 0,
          width: px * 0.28, height: px * 0.28, borderRadius: '50%',
          background: statusColor, border: '2px solid var(--color-background-primary)',
        }} />
      )}
    </span>
  );
}

export default Avatar;
