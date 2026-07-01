import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Select — dropdown picker. Focus/open border = МГТС blue,
 * selected option highlighted in brand-subtle.
 */
export function Select({
  label, placeholder = 'Выберите', options = [], value, onChange,
  disabled = false, error, size = 'm', style, ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const heights = { s: 36, m: 44, l: 52 };

  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find(o => (o.value ?? o) === value);
  const borderColor = error ? 'var(--color-accent-negative)' : open ? 'var(--color-brand)' : 'var(--color-control-stroke)';

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-compact)', position: 'relative', ...style }}>
      {label && <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>}
      <button
        type="button" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          height: heights[size], padding: '0 14px', width: '100%',
          background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
          border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-m)',
          fontFamily: 'var(--font-compact)', fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer',
          color: selected ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          transition: 'border-color var(--duration-fast) var(--ease-standard)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? (selected.label ?? selected) : placeholder}
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ color: 'var(--color-icons-secondary)', flexShrink: 0,
                   transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-standard)' }}>
          <path d="M6 9.5L12 15.5L18 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: 'var(--color-background-primary)', border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius-m)', boxShadow: 'var(--shadow-middle)', padding: 4,
          maxHeight: 260, overflowY: 'auto',
        }}>
          {options.map((o) => {
            const val = o.value ?? o; const lbl = o.label ?? o;
            const sel = val === value;
            return (
              <div key={val} onClick={() => { onChange && onChange(val); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 'var(--radius-s)', cursor: 'pointer', fontSize: 15,
                  background: sel ? 'var(--color-brand-subtle)' : 'transparent',
                  color: sel ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--color-background-secondary)'; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
              >
                {lbl}
                {sel && <Icon name="CheckSize16StyleOutline" size={16} style={{ color: 'var(--color-brand)' }} />}
              </div>
            );
          })}
        </div>
      )}
      {error && <span style={{ fontSize: 12, color: 'var(--color-accent-negative)' }}>{error}</span>}
    </div>
  );
}

export default Select;
