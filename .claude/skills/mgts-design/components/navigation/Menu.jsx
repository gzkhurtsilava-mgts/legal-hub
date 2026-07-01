import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Menu (Droplist) — floating list of options / context menu.
 * items: [{ label, icon?, onClick?, tone?: 'default'|'negative', disabled?, divider? }]
 * Selected/destructive states follow Granat tokens.
 */
export function Menu({ items = [], style, ...rest }) {
  return (
    <div style={{
      minWidth: 220, padding: 4, background: 'var(--color-background-primary)',
      border: '1px solid var(--color-line)', borderRadius: 'var(--radius-m)',
      boxShadow: 'var(--shadow-middle)', fontFamily: 'var(--font-compact)', ...style,
    }} {...rest}>
      {items.map((it, i) => {
        if (it.divider) return <div key={i} style={{ height: 1, background: 'var(--color-line)', margin: '4px 0' }} />;
        const neg = it.tone === 'negative';
        return (
          <button
            key={i} type="button" disabled={it.disabled} onClick={it.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', border: 'none', background: 'transparent',
              borderRadius: 'var(--radius-s)', cursor: it.disabled ? 'not-allowed' : 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-compact)', fontSize: 15,
              color: it.disabled ? 'var(--color-text-tertiary)' : neg ? 'var(--color-accent-negative)' : 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = 'var(--color-background-secondary)'; }}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {it.icon && <Icon name={it.icon} size={24} style={{ flexShrink: 0, color: neg ? 'var(--color-accent-negative)' : 'var(--color-icons-secondary)' }} />}
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.shortcut && <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{it.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Menu;
