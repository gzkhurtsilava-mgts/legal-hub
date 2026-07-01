import React from 'react';

/**
 * MGTS Tabs — horizontal tab bar. Active tab gets a МГТС-blue
 * underline indicator and brand text color.
 */
export function Tabs({ tabs = [], value, onChange, style, ...rest }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-line)', ...style }} {...rest}>
      {tabs.map((t) => {
        const val = t.value ?? t;
        const lbl = t.label ?? t;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange && onChange(val)}
            style={{
              position: 'relative', border: 'none', background: 'transparent',
              padding: '12px 16px', cursor: 'pointer',
              fontFamily: 'var(--font-compact)', fontSize: 15,
              fontWeight: active ? 'var(--fw-medium)' : 'var(--fw-regular)',
              color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
              transition: 'color var(--duration-fast) var(--ease-standard)',
            }}
          >
            {lbl}
            <span style={{
              position: 'absolute', left: 8, right: 8, bottom: -1, height: 2,
              borderRadius: 2,
              background: active ? 'var(--color-brand)' : 'transparent',
            }} />
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
