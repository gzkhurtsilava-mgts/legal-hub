import React from 'react';

/**
 * MGTS RangeSlider — dual-thumb range selector (Granat Slider-Range).
 * Brand-blue fill between the two thumbs. value = [min, max].
 */
export function RangeSlider({ value = [20, 80], onChange, min = 0, max = 100, step = 1, disabled = false, showValues = false, format = (v) => v, style, ...rest }) {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  const set = (idx, raw) => {
    const v = Math.max(min, Math.min(max, Number(raw)));
    const next = idx === 0 ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)];
    onChange && onChange(next);
  };
  const thumb = (idx, v) => (
    <span style={{
      position: 'absolute', left: `calc(${pct(v)}% - 10px)`, top: 0,
      width: 20, height: 20, borderRadius: '50%', background: '#fff',
      border: `2px solid ${disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)'}`,
      boxShadow: 'var(--shadow-low)', pointerEvents: 'none',
    }} />
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', ...style }} {...rest}>
      {showValues && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-compact)', fontSize: 14, color: 'var(--color-text-secondary)' }}>
          <span>{format(lo)}</span><span>{format(hi)}</span>
        </div>
      )}
      <div style={{ position: 'relative', height: 20 }}>
        <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 4, borderRadius: 2, background: 'var(--granat-grey-100)' }} />
        <div style={{ position: 'absolute', top: 8, left: pct(lo) + '%', width: (pct(hi) - pct(lo)) + '%', height: 4, borderRadius: 2,
          background: disabled ? 'var(--granat-grey-200)' : 'var(--color-brand)' }} />
        {[0, 1].map((idx) => (
          <input key={idx} type="range" value={value[idx]} min={min} max={max} step={step} disabled={disabled}
            onChange={(e) => set(idx, e.target.value)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 20, margin: 0,
              WebkitAppearance: 'none', appearance: 'none', background: 'transparent', pointerEvents: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer' }}
            className="mgts-range-thumb" />
        ))}
        {thumb(0, lo)}
        {thumb(1, hi)}
        <style>{'.mgts-range-thumb::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:20px;height:20px;border-radius:50%;background:transparent;cursor:pointer}.mgts-range-thumb::-moz-range-thumb{pointer-events:auto;width:20px;height:20px;border:none;border-radius:50%;background:transparent;cursor:pointer}'}</style>
      </div>
    </div>
  );
}

export default RangeSlider;
