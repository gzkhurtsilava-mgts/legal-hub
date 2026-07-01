import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Steps — horizontal wizard / step progress indicator.
 * Completed steps: brand fill + check; current: brand ring; upcoming: grey.
 * steps: [{ label, description? }]
 */
export function Steps({ steps = [], current = 0, style, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', ...style }} {...rest}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        const circleBg = done ? 'var(--color-brand)' : active ? 'var(--color-background-primary)' : 'var(--color-background-secondary)';
        const circleBorder = done ? 'transparent' : active ? 'var(--color-brand)' : 'var(--color-control-stroke)';
        const numColor = done ? '#fff' : active ? 'var(--color-text-brand)' : 'var(--color-text-tertiary)';
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 120 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: circleBg, border: `2px solid ${circleBorder}`, color: numColor,
                fontFamily: 'var(--font-compact)', fontSize: 14, fontWeight: 'var(--fw-medium)',
              }}>
                {done ? <Icon name="CheckSize16StyleOutline" size={16} /> : i + 1}
              </span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-compact)', fontSize: 14, fontWeight: active ? 'var(--fw-medium)' : 'var(--fw-regular)',
                  color: active || done ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{s.label ?? s}</div>
                {s.description && <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{s.description}</div>}
              </div>
            </div>
            {!last && <div style={{ flex: 1, height: 2, background: done ? 'var(--color-brand)' : 'var(--color-line)', marginTop: 15, borderRadius: 1 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Steps;
