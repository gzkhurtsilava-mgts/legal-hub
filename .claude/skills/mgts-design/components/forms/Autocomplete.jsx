import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Autocomplete — text field with a filtered suggestion dropdown.
 * options: string[]. Filters as you type; click a suggestion to select.
 */
export function Autocomplete({
  label, placeholder = 'Начните вводить', value = '', onChange, onSelect,
  options = [], disabled = false, size = 'm', style, ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const ref = React.useRef(null);
  const heights = { s: 36, m: 44, l: 52 };

  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const matches = value
    ? options.filter(o => String(o).toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : options.slice(0, 8);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-compact)', ...style }}>
      {label && <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: heights[size], padding: '0 14px',
        background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
        border: `1px solid ${focus ? 'var(--color-brand)' : 'var(--color-control-stroke)'}`,
        borderRadius: 'var(--radius-m)', transition: 'border-color var(--duration-fast) var(--ease-standard)',
      }}>
        <Icon name="SearchSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)', flexShrink: 0 }} />
        <input
          value={value} disabled={disabled} placeholder={placeholder}
          onChange={(e) => { onChange && onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocus(true); setOpen(true); }}
          onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-compact)', fontSize: 15, color: 'var(--color-text-primary)' }}
          {...rest}
        />
      </div>
      {open && matches.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: 'var(--color-background-primary)', border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius-m)', boxShadow: 'var(--shadow-middle)', padding: 4, maxHeight: 260, overflowY: 'auto',
        }}>
          {matches.map((o, i) => (
            <div key={i}
              onMouseDown={() => { onChange && onChange(String(o)); onSelect && onSelect(o); setOpen(false); }}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-s)', cursor: 'pointer', fontSize: 15, color: 'var(--color-text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-background-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;
