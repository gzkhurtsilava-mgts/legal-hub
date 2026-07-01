import React from 'react';

/**
 * MGTS Pagination dots — page indicator. Active dot is МГТС blue and wider.
 */
export function Pagination({ count = 3, active = 0, onChange, style, ...rest }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }} {...rest}>
      {Array.from({ length: count }).map((_, i) => {
        const on = i === active;
        return (
          <span
            key={i} onClick={() => onChange && onChange(i)}
            style={{
              width: on ? 20 : 8, height: 8, borderRadius: 'var(--radius-xl)',
              background: on ? 'var(--color-brand)' : 'var(--granat-grey-200)',
              cursor: onChange ? 'pointer' : 'default',
              transition: 'width var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard)',
            }}
          />
        );
      })}
    </div>
  );
}

export default Pagination;
