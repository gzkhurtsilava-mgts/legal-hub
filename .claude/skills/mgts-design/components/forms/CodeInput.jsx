import React from 'react';

/**
 * MGTS CodeInput — one-time-code / PIN entry. N separate boxes.
 * Active box border = МГТС blue; error = negative. Auto-advances.
 */
export function CodeInput({ length = 4, value = '', onChange, error = false, disabled = false, style, ...rest }) {
  const refs = React.useRef([]);
  const chars = value.padEnd(length).split('').slice(0, length);

  const setAt = (i, ch) => {
    const next = chars.map((c, idx) => (idx === i ? ch : c)).join('').trimEnd();
    onChange && onChange(next);
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };

  return (
    <div style={{ display: 'inline-flex', gap: 8, ...style }} {...rest}>
      {Array.from({ length }).map((_, i) => {
        const ch = chars[i].trim();
        return (
          <input
            key={i} ref={(el) => (refs.current[i] = el)}
            value={ch} disabled={disabled} inputMode="numeric" maxLength={1}
            onChange={(e) => setAt(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !ch && i > 0) refs.current[i - 1]?.focus(); }}
            style={{
              width: 48, height: 56, textAlign: 'center',
              fontFamily: 'var(--font-compact)', fontSize: 24, fontWeight: 'var(--fw-medium)',
              color: 'var(--color-text-primary)',
              background: disabled ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
              border: `1px solid ${error ? 'var(--color-accent-negative)' : (ch ? 'var(--color-brand)' : 'var(--color-control-stroke)')}`,
              borderRadius: 'var(--radius-m)', outline: 'none',
              transition: 'border-color var(--duration-fast) var(--ease-standard)',
            }}
            onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--color-brand)'; }}
            onBlur={(e) => { if (!error) e.target.style.borderColor = ch ? 'var(--color-brand)' : 'var(--color-control-stroke)'; }}
          />
        );
      })}
    </div>
  );
}

export default CodeInput;
