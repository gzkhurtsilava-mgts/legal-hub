import React from 'react';

/**
 * MGTS TextList — bulleted or numbered content list (Granat Text-List).
 * type: bullet | number. Brand-blue markers.
 * items: string[] or ReactNode[].
 */
export function TextList({ items = [], type = 'bullet', style, ...rest }) {
  return (
    <ul style={{
      listStyle: 'none', margin: 0, padding: 0,
      display: 'flex', flexDirection: 'column', gap: 10,
      fontFamily: 'var(--font-sans)', ...style,
    }} {...rest}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {type === 'number' ? (
            <span style={{
              flexShrink: 0, minWidth: 24, height: 24, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-brand-subtle)', color: 'var(--color-text-brand)',
              fontFamily: 'var(--font-compact)', fontSize: 13, fontWeight: 'var(--fw-medium)',
            }}>{i + 1}</span>
          ) : (
            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', marginTop: 8 }} />
          )}
          <span style={{ fontSize: 15, lineHeight: '22px', color: 'var(--color-text-primary)' }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default TextList;
