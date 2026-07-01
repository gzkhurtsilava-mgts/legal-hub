import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Collapsible — accordion row. Title row toggles a content panel.
 * Chevron rotates; controlled or uncontrolled.
 */
export function Collapsible({ title, children, defaultOpen = false, open: openProp, onToggle, style, ...rest }) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp != null ? openProp : openState;
  const toggle = () => { onToggle ? onToggle(!open) : setOpenState(o => !o); };
  return (
    <div style={{ borderBottom: '1px solid var(--color-line)', ...style }} {...rest}>
      <button
        type="button" onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%',
          padding: '16px 0', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-compact)', fontSize: 17, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)',
        }}
      >
        <span>{title}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ color: 'var(--color-icons-secondary)', flexShrink: 0,
                   transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-base) var(--ease-standard)' }}>
          <path d="M6 9.5L12 15.5L18 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontFamily: 'var(--font-compact)', fontSize: 15, lineHeight: '22px', color: 'var(--color-text-secondary)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Collapsible;
