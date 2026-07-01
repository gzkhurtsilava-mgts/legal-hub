import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS InlineEdit — text that turns into an input on click (edit-in-place).
 * Shows an edit pencil on hover; Enter/blur commits, Esc cancels.
 */
export function InlineEdit({ value = '', onChange, placeholder = 'Не задано', disabled = false, style, ...rest }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [hover, setHover] = React.useState(false);
  React.useEffect(() => setDraft(value), [value]);

  const commit = () => { setEditing(false); if (draft !== value) onChange && onChange(draft); };
  const cancel = () => { setEditing(false); setDraft(value); };

  if (editing) {
    return (
      <input
        autoFocus value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
        style={{
          height: 36, padding: '0 12px', border: '1px solid var(--color-brand)',
          borderRadius: 'var(--radius-s)', outline: 'none',
          fontFamily: 'var(--font-compact)', fontSize: 15, color: 'var(--color-text-primary)',
          background: 'var(--color-background-primary)', ...style,
        }}
        {...rest}
      />
    );
  }
  return (
    <span
      onClick={() => !disabled && setEditing(true)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 8px',
        borderRadius: 'var(--radius-s)', cursor: disabled ? 'default' : 'text',
        background: hover && !disabled ? 'var(--color-background-secondary)' : 'transparent',
        fontFamily: 'var(--font-compact)', fontSize: 15,
        color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
        transition: 'background var(--duration-fast) var(--ease-standard)', ...style,
      }}
    >
      {value || placeholder}
      {!disabled && hover && <Icon name="EditSize16StyleOutline" size={16} style={{ color: 'var(--color-icons-secondary)' }} />}
    </span>
  );
}

export default InlineEdit;
