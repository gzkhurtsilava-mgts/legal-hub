import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS TextField — Granat 2 text input.
 * Label on top, placeholder inside, description/error below.
 * Focus border = МГТС blue; error border = negative.
 */
export function TextField({
  label,
  placeholder,
  value,
  onChange,
  description,
  error,
  disabled = false,
  size = 'm',
  iconLeft,
  iconRight,
  type = 'text',
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const heights = { s: 36, m: 44, l: 52 };

  const borderColor = error
    ? 'var(--color-accent-negative)'
    : focus
      ? 'var(--color-brand)'
      : 'var(--color-control-stroke)';

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-compact)', ...style }}>
      {label && (
        <span style={{ fontSize: 14, fontWeight: 'var(--fw-regular)', color: 'var(--color-text-secondary)' }}>{label}</span>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: heights[size], padding: '0 14px',
        background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-m)',
        transition: 'border-color var(--duration-fast) var(--ease-standard)',
      }}>
        {iconLeft && <Icon name={iconLeft} size={24} style={{ color: 'var(--color-icons-secondary)', flexShrink: 0 }} />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-compact)', fontSize: 15,
            color: 'var(--color-text-primary)',
          }}
          {...rest}
        />
        {iconRight && <Icon name={iconRight} size={24} style={{ color: 'var(--color-icons-secondary)', flexShrink: 0 }} />}
      </div>
      {(error || description) && (
        <span style={{ fontSize: 12, lineHeight: '16px', color: error ? 'var(--color-accent-negative)' : 'var(--color-text-secondary)' }}>
          {error || description}
        </span>
      )}
    </label>
  );
}

export default TextField;
