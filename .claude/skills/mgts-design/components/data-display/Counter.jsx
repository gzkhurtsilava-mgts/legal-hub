import React from 'react';

/**
 * MGTS Counter — small numeric badge (notification count).
 * tone: brand | negative | neutral. Caps at max with "+".
 */
export function Counter({ value = 0, max = 99, tone = 'negative', style, ...rest }) {
  const display = value > max ? `${max}+` : String(value);
  const tones = {
    brand:    { bg: 'var(--color-brand)', fg: '#fff' },
    negative: { bg: 'var(--color-accent-negative)', fg: '#fff' },
    neutral:  { bg: 'var(--granat-grey-200)', fg: 'var(--color-text-primary)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-xl)',
      background: tones.bg, color: tones.fg,
      fontFamily: 'var(--font-compact)', fontSize: 11, fontWeight: 'var(--fw-bold)',
      lineHeight: 1, ...style,
    }} {...rest}>
      {display}
    </span>
  );
}

export default Counter;
