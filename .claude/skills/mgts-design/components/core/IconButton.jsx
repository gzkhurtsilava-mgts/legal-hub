import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS IconButton — square icon-only button.
 * Variants: primary | secondary | ghost
 * Sizes: xs (28) | s (36) | m (44) | l (52)
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'm',
  disabled = false,
  ariaLabel,
  style,
  ...rest
}) {
  const heights = { xs: 28, s: 36, m: 44, l: 52 };
  const iconSize = { xs: 16, s: 24, m: 24, l: 32 };

  const palette = {
    primary: { background: 'var(--color-brand)', color: '#fff', border: '1px solid transparent', hover: 'var(--color-brand-hover)' },
    secondary: { background: 'transparent', color: 'var(--color-text-brand)', border: '1px solid var(--color-brand)', hover: 'var(--color-brand-subtle)' },
    ghost: { background: 'transparent', color: 'var(--color-icons-primary)', border: '1px solid transparent', hover: 'var(--color-background-secondary)' },
  }[variant];

  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: heights[size],
        height: heights[size],
        background: disabled ? 'transparent' : (hover ? palette.hover : palette.background),
        color: disabled ? 'var(--color-text-tertiary)' : palette.color,
        border: palette.border,
        borderRadius: 'var(--radius-m)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-fast) var(--ease-standard)',
        padding: 0,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize[size]} />
    </button>
  );
}

export default IconButton;
