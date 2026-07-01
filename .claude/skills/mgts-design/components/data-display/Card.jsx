import React from 'react';

/**
 * MGTS Card — surface container. radius-m or radius-l, shadow-low.
 * variant: elevated (shadow) | outlined (border) | flat (secondary bg)
 */
export function Card({ variant = 'elevated', radius = 'm', padding = 20, children, style, ...rest }) {
  const base = {
    elevated: { background: 'var(--color-background-primary)', boxShadow: 'var(--shadow-low)', border: '1px solid transparent' },
    outlined: { background: 'var(--color-background-primary)', boxShadow: 'none', border: '1px solid var(--color-line)' },
    flat: { background: 'var(--color-background-secondary)', boxShadow: 'none', border: '1px solid transparent' },
  }[variant];
  return (
    <div style={{
      borderRadius: radius === 'l' ? 'var(--radius-l)' : 'var(--radius-m)',
      padding, ...base, ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

export default Card;
