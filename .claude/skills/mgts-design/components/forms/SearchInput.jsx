import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS SearchInput — search field with leading magnifier and clear (×).
 * Filled grey style by default; focus border = МГТС blue.
 */
export function SearchInput({ value = '', onChange, onClear, placeholder = 'Поиск', size = 'm', filled = true, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const heights = { s: 36, m: 44, l: 52 };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, height: heights[size], padding: '0 14px',
      background: filled && !focus ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
      border: `1px solid ${focus ? 'var(--color-brand)' : (filled ? 'transparent' : 'var(--color-control-stroke)')}`,
      borderRadius: 'var(--radius-m)',
      transition: 'border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)',
      ...style,
    }}>
      <Icon name="SearchSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)', flexShrink: 0 }} />
      <input
        type="search" value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-compact)', fontSize: 15, color: 'var(--color-text-primary)',
        }}
        {...rest}
      />
      {value && (
        <span onClick={() => { onClear ? onClear() : (onChange && onChange({ target: { value: '' } })); }}
          style={{ display: 'inline-flex', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="CrossCircleSize24StyleFill" size={24} style={{ color: 'var(--color-icons-tertiary)' }} />
        </span>
      )}
    </div>
  );
}

export default SearchInput;
