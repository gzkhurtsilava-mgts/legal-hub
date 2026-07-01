import React from 'react';

/**
 * MGTS Tooltip — dark surface, white text, radius-s, shadow-middle.
 * Wraps a trigger; shows on hover. placement: top | bottom | left | right
 */
export function Tooltip({ content, placement = 'top', children, style, ...rest }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  }[placement];
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      {...rest}
    >
      {children}
      {show && (
        <span style={{
          position: 'absolute', zIndex: 40, ...pos,
          background: 'var(--granat-graphite)', color: '#fff',
          fontFamily: 'var(--font-compact)', fontSize: 13, lineHeight: '16px',
          padding: '6px 10px', borderRadius: 'var(--radius-s)',
          boxShadow: 'var(--shadow-middle)', whiteSpace: 'nowrap',
          pointerEvents: 'none', ...style,
        }}>
          {content}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
