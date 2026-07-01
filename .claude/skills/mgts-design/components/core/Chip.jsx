import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Chip — selectable choice chip. radius-xl pill.
 * Selected = МГТС blue fill + white text. Optional icon, removable.
 */
export function Chip({
  children, icon, selected = false, disabled = false,
  onClick, onRemove, size = 'm', style, ...rest
}) {
  const heights = { s: 32, m: 40 };
  const [hover, setHover] = React.useState(false);
  const bg = disabled
    ? 'var(--color-background-secondary)'
    : selected
      ? 'var(--color-brand)'
      : hover ? 'var(--granat-grey-100)' : 'var(--color-background-secondary)';
  const fg = disabled
    ? 'var(--color-text-tertiary)'
    : selected ? '#fff' : 'var(--color-text-primary)';
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: heights[size], padding: '0 16px', border: 'none',
        borderRadius: 'var(--radius-xl)', background: bg, color: fg,
        fontFamily: 'var(--font-compact)', fontSize: 14, fontWeight: 'var(--fw-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        transition: 'background var(--duration-fast) var(--ease-standard)', ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} style={{ flexShrink: 0 }} />}
      {children}
      {onRemove && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ display: 'inline-flex', marginLeft: 2, marginRight: -4 }}>
          <Icon name="CrossSize16StyleOutline" size={16} />
        </span>
      )}
    </button>
  );
}

export default Chip;
