import React from 'react';

/**
 * MGTS Textarea — multi-line input. Focus border = МГТС blue.
 * Label on top, optional character counter and error below.
 */
export function Textarea({
  label, placeholder, value = '', onChange, description, error,
  disabled = false, rows = 4, maxLength, style, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderColor = error ? 'var(--color-accent-negative)' : focus ? 'var(--color-brand)' : 'var(--color-control-stroke)';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-compact)', ...style }}>
      {label && <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>}
      <textarea
        value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        disabled={disabled} maxLength={maxLength}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          resize: 'vertical', padding: '12px 14px',
          background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
          border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-m)',
          fontFamily: 'var(--font-compact)', fontSize: 15, lineHeight: '20px',
          color: 'var(--color-text-primary)', outline: 'none',
          transition: 'border-color var(--duration-fast) var(--ease-standard)',
        }}
        {...rest}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, lineHeight: '16px', color: error ? 'var(--color-accent-negative)' : 'var(--color-text-secondary)' }}>
          {error || description}
        </span>
        {maxLength != null && (
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{value.length}/{maxLength}</span>
        )}
      </div>
    </label>
  );
}

export default Textarea;
