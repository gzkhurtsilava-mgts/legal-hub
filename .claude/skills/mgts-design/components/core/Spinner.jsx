import React from 'react';

/**
 * MGTS Spinner — circular loading indicator. МГТС-blue arc on a track.
 * sizes: s(16) m(24) l(32) xl(44). tone: brand | inverted | secondary.
 */
export function Spinner({ size = 'm', tone = 'brand', style, ...rest }) {
  const px = { s: 16, m: 24, l: 32, xl: 44 }[size];
  const stroke = { s: 2, m: 2.5, l: 3, xl: 4 }[size];
  const color = { brand: 'var(--color-brand)', inverted: '#fff', secondary: 'var(--color-icons-secondary)' }[tone];
  return (
    <span
      role="status" aria-label="Загрузка"
      style={{ display: 'inline-flex', width: px, height: px, ...style }}
      {...rest}
    >
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none"
        style={{ animation: 'mgts-spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={stroke}
          style={{ color: 'var(--color-line)' }} opacity="0.5" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      </svg>
      <style>{'@keyframes mgts-spin{to{transform:rotate(360deg)}}'}</style>
    </span>
  );
}

export default Spinner;
