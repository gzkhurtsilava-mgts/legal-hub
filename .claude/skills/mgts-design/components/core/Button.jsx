import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Button — Granat 2 button rebranded to МГТС blue.
 * Variants: primary | secondary | ghost | negative
 * Sizes: xs (28) | s (36) | m (44, default) | l (52)
 */
export function Button({
  variant = 'primary',
  size = 'm',
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  children,
  style,
  ...rest
}) {
  const heights = { xs: 28, s: 36, m: 44, l: 52 };
  const padding = { xs: '0 12px', s: '0 16px', m: '0 20px', l: '0 24px' };
  const fontSize = { xs: 13, s: 14, m: 15, l: 17 };
  const iconSize = { xs: 16, s: 16, m: 24, l: 24 };

  const palette = {
    primary: {
      background: 'var(--color-brand)',
      color: '#ffffff',
      border: '1px solid transparent',
      '--hover-bg': 'var(--color-brand-hover)',
      '--active-bg': 'var(--color-brand-active)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-text-brand)',
      border: '1px solid var(--color-brand)',
      '--hover-bg': 'var(--color-brand-subtle)',
      '--active-bg': 'var(--color-brand-subtle)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-brand)',
      border: '1px solid transparent',
      '--hover-bg': 'var(--color-brand-subtle)',
      '--active-bg': 'var(--color-brand-subtle)',
    },
    negative: {
      background: 'var(--color-accent-negative)',
      color: '#ffffff',
      border: '1px solid transparent',
      '--hover-bg': '#e0481a',
      '--active-bg': '#c93f16',
    },
  }[variant];

  const disabledStyle = disabled
    ? {
        background: variant === 'primary' || variant === 'negative'
          ? 'var(--granat-grey-100)' : 'transparent',
        color: 'var(--color-text-tertiary)',
        border: variant === 'secondary'
          ? '1px solid var(--color-line)' : '1px solid transparent',
        cursor: 'not-allowed',
      }
    : {};

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const bg = disabled
    ? disabledStyle.background
    : active
      ? palette['--active-bg']
      : hover
        ? palette['--hover-bg']
        : palette.background;

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: heights[size],
        padding: padding[size],
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-compact)',
        fontSize: fontSize[size],
        fontWeight: 'var(--fw-medium)',
        lineHeight: 1,
        color: disabled ? disabledStyle.color : palette.color,
        background: bg,
        border: disabled ? disabledStyle.border : palette.border,
        borderRadius: 'var(--radius-m)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
        transform: active && !disabled ? 'scale(0.98)' : 'scale(1)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={iconSize[size]} style={{ flexShrink: 0 }} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize[size]} style={{ flexShrink: 0 }} />}
    </button>
  );
}

export default Button;
