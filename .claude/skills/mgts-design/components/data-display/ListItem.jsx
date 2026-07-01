import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS ListItem — control-list row (Granat Cell).
 * Leading icon/avatar slot, title + optional description, trailing slot.
 * Clickable rows highlight on hover; selected row tints brand-subtle.
 */
export function ListItem({
  icon, title, description, trailing, selected = false, onClick, size = 'm', style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const minH = { s: 48, m: 56, l: 64 }[size];
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, minHeight: minH, padding: '8px 16px',
        background: selected ? 'var(--color-brand-subtle)' : (clickable && hover ? 'var(--color-background-secondary)' : 'transparent'),
        borderRadius: 'var(--radius-m)', cursor: clickable ? 'pointer' : 'default',
        fontFamily: 'var(--font-compact)', transition: 'background var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {icon && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-s)',
          background: 'var(--color-background-secondary)', color: 'var(--color-icons-secondary)',
        }}>
          <Icon name={icon} size={24} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>}
      </div>
      {trailing && <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{trailing}</div>}
    </div>
  );
}

export default ListItem;
