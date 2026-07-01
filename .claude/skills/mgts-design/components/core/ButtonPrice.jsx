import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS ButtonPrice — CTA button with a price (Granat Button-Price), for tariffs.
 * Label + price stacked or inline. variant: primary | secondary.
 */
export function ButtonPrice({
  label, price, period, variant = 'primary', size = 'l', iconLeft, disabled = false, fullWidth = false, onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const heights = { m: 44, l: 52 };
  const primary = variant === 'primary';
  const bg = disabled ? 'var(--granat-grey-100)' : primary ? (hover ? 'var(--color-brand-hover)' : 'var(--color-brand)') : (hover ? 'var(--color-brand-subtle)' : 'transparent');
  const fg = disabled ? 'var(--color-text-tertiary)' : primary ? '#fff' : 'var(--color-text-brand)';
  const subFg = primary ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)';
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        height: heights[size], padding: '0 24px', width: fullWidth ? '100%' : 'auto',
        background: bg, color: fg,
        border: primary ? '1px solid transparent' : '1px solid var(--color-brand)',
        borderRadius: 'var(--radius-m)', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-compact)', fontWeight: 'var(--fw-medium)',
        transition: 'background var(--duration-fast) var(--ease-standard)', ...style,
      }}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={24} style={{ flexShrink: 0 }} />}
      <span style={{ fontSize: 15 }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, marginLeft: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 'var(--fw-bold)' }}>{price}</span>
        {period && <span style={{ fontSize: 13, color: subFg }}>{period}</span>}
      </span>
    </button>
  );
}

export default ButtonPrice;
