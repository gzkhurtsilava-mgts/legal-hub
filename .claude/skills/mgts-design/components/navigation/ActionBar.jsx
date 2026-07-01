import React from 'react';

/**
 * MGTS ActionBar — sticky bottom action bar (Granat Bottom-Button).
 * Holds primary/secondary actions; top hairline + surface + shadow.
 * Pass buttons as children; align right (default) / between / center.
 */
export function ActionBar({ children, align = 'right', sticky = false, style, ...rest }) {
  const justify = { right: 'flex-end', left: 'flex-start', between: 'space-between', center: 'center' }[align];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: justify, gap: 12,
      padding: '16px 24px', background: 'var(--color-background-primary)',
      borderTop: '1px solid var(--color-line)',
      ...(sticky ? { position: 'sticky', bottom: 0, zIndex: 20, boxShadow: '0 -4px 16px rgba(29,32,35,0.06)' } : {}),
      ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

export default ActionBar;
