import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Link — inline text link in МГТС blue.
 * variant: primary (brand) | secondary (graphite) | inverted (on dark)
 * Optional leading/trailing icon and underline.
 */
export function Link({
  href = '#', variant = 'primary', underline = false,
  iconLeft, iconRight, children, onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const color = {
    primary: 'var(--color-text-brand)',
    secondary: 'var(--color-text-primary)',
    inverted: 'var(--color-text-inverted)',
  }[variant];
  return (
    <a
      href={href} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontFamily: 'var(--font-compact)', fontSize: 15, fontWeight: 'var(--fw-medium)',
        color, textDecoration: underline || hover ? 'underline' : 'none',
        textUnderlineOffset: 3, cursor: 'pointer',
        opacity: hover ? 0.85 : 1,
        transition: 'opacity var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={16} style={{ flexShrink: 0 }} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} style={{ flexShrink: 0 }} />}
    </a>
  );
}

export default Link;
