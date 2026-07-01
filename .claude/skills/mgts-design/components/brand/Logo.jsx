import React from 'react';

/**
 * MGTS Logo — МГТС wordmark lockup. The brand egg + "МГТС" in MTS Wide.
 * variant: full (egg + text) | mark (egg only) | text (text only)
 * tone: brand (blue egg) | mono (graphite) | inverted (white, on dark)
 */
export function Logo({ variant = 'full', tone = 'brand', size = 28, style, ...rest }) {
  const eggBg = tone === 'inverted' ? '#fff' : tone === 'mono' ? 'var(--color-text-primary)' : 'var(--color-brand)';
  const eggFg = tone === 'inverted' ? 'var(--color-brand)' : '#fff';
  const textColor = tone === 'inverted' ? '#fff' : 'var(--color-text-primary)';
  const egg = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, flexShrink: 0,
      background: eggBg, color: eggFg, borderRadius: 'calc(var(--radius-s) * 0.66)',
      fontFamily: 'var(--font-wide)', fontWeight: 700, fontSize: size * 0.42, letterSpacing: '0.01em',
    }}>МГ</span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36, ...style }} {...rest}>
      {variant !== 'text' && egg}
      {variant !== 'mark' && (
        <span style={{ fontFamily: 'var(--font-wide)', fontWeight: 700, fontSize: size * 0.64, color: textColor, letterSpacing: '0.01em' }}>МГТС</span>
      )}
    </span>
  );
}

export default Logo;
