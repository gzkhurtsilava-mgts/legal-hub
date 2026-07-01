import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS Modal — centered dialog over a dimmed overlay.
 * shadow-high, radius-l. Header (title + close), body, optional footer.
 */
export function Modal({ open, onClose, title, children, footer, width = 480, style, ...rest }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--color-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto',
          background: 'var(--color-background-primary)',
          borderRadius: 'var(--radius-l)', boxShadow: 'var(--shadow-high)',
          fontFamily: 'var(--font-compact)', ...style,
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '24px 24px 0' }}>
          {title && <h3 style={{ margin: 0, fontFamily: 'var(--font-compact)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h3>}
          <span onClick={onClose} style={{ cursor: 'pointer', marginLeft: 'auto' }}>
            <Icon name="CrossSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)' }} />
          </span>
        </div>
        <div style={{ padding: '16px 24px 24px', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '0 24px 24px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
