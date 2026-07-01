import React from 'react';

/**
 * MGTS Badge — status pill. tone: neutral | positive | warning | negative | brand
 * Soft tonal fill + readable text (color + label only — no status dot).
 */
export function Badge({ tone = 'neutral', children, style, ...rest }) {
  const tones = {
    neutral:  { bg: 'var(--color-background-secondary)', fg: 'var(--color-text-secondary)' },
    positive: { bg: 'var(--color-accent-positive-bg)', fg: '#1b8c3c' },
    warning:  { bg: 'var(--color-accent-warning-bg)', fg: '#9a7000' },
    negative: { bg: 'var(--color-accent-negative-bg)', fg: '#c43c12' },
    brand:    { bg: 'var(--color-accent-brand-bg)', fg: 'var(--color-text-brand)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, padding: '0 10px', borderRadius: 'var(--radius-s)',
      background: tones.bg, color: tones.fg,
      fontFamily: 'var(--font-compact)', fontSize: 13, fontWeight: 'var(--fw-medium)',
      whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
