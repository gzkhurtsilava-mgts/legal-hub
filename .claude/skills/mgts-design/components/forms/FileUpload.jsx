import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/**
 * MGTS FileUpload (Attach) — dashed drop zone + attached-file rows.
 * Drag/click to add; each file shows name, size and a remove control.
 * files: [{ name, size?, progress?, error? }]
 */
export function FileUpload({ files = [], onAdd, onRemove, hint = 'PDF, DOCX до 20 МБ', label = 'Перетащите файлы или нажмите для выбора', disabled = false, style, ...rest }) {
  const [over, setOver] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--font-compact)', ...style }} {...rest}>
      <div
        onClick={() => !disabled && onAdd && onAdd()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled && onAdd) onAdd(e); }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: '28px 20px', textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
          background: over ? 'var(--color-brand-subtle)' : 'var(--color-background-secondary)',
          border: `1.5px dashed ${over ? 'var(--color-brand)' : 'var(--color-control-stroke)'}`,
          borderRadius: 'var(--radius-l)',
          transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
        }}
      >
        <Icon name="DownloadSize32StyleOutline" size={32} style={{ color: 'var(--color-icons-brand)' }} />
        <div style={{ fontSize: 15, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{hint}</div>
      </div>
      {files.map((f, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          border: `1px solid ${f.error ? 'var(--color-accent-negative)' : 'var(--color-line)'}`,
          borderRadius: 'var(--radius-m)', background: 'var(--color-background-primary)',
        }}>
          <Icon name="DocumentSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 'var(--fw-medium)', color: 'var(--color-text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
            <div style={{ fontSize: 12, color: f.error ? 'var(--color-accent-negative)' : 'var(--color-text-tertiary)' }}>
              {f.error || f.size}
            </div>
          </div>
          {onRemove && (
            <span onClick={() => onRemove(i)} style={{ cursor: 'pointer', flexShrink: 0, display: 'inline-flex' }}>
              <Icon name="DeleteSize24StyleOutline" size={24} style={{ color: 'var(--color-icons-secondary)' }} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default FileUpload;
