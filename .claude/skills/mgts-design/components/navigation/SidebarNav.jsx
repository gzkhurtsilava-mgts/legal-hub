import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS SidebarNav item — icon + label row for the left navigation.
 * Active item: brand-subtle fill, brand text/icon, left indicator bar.
 */
export function SidebarNav({ icon, label, active = false, badge, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
        borderRadius: 'var(--radius-m)',
        background: active ? 'var(--color-brand-subtle)' : (hover ? 'var(--color-background-secondary)' : 'transparent'),
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
        fontFamily: 'var(--font-compact)', fontSize: 15, fontWeight: active ? 'var(--fw-medium)' : 'var(--fw-regular)',
        transition: 'background var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: '0 3px 3px 0',
        background: active ? 'var(--color-brand)' : 'transparent',
      }} />
      {icon && <Icon name={icon} size={24} style={{ color: active ? 'var(--color-brand)' : 'var(--color-icons-secondary)', flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-xl)',
          background: active ? 'var(--color-brand)' : 'var(--granat-grey-200)', color: '#fff',
          fontSize: 12, fontWeight: 'var(--fw-medium)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{badge}</span>
      )}
    </button>
  );
}

export default SidebarNav;
