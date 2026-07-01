import React from 'react';

/**
 * MGTS Breadcrumbs — path navigation. Last item is current (non-link).
 * items: [{ label, onClick? }]
 */
export function Breadcrumbs({ items = [], style, ...rest }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
      fontFamily: 'var(--font-compact)', fontSize: 14, ...style }} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <span
              onClick={!last ? it.onClick : undefined}
              style={{
                color: last ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: last ? 'var(--fw-medium)' : 'var(--fw-regular)',
                cursor: last ? 'default' : 'pointer',
              }}
            >{it.label}</span>
            {!last && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                style={{ color: 'var(--color-icons-tertiary)', flexShrink: 0 }}>
                <path d="M9.5 6L15.5 12L9.5 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
