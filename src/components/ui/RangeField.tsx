import React from 'react';

interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  baseline?: number;
  format?: (n: number) => string;
  onChange: (n: number) => void;
}

export function RangeField({ id, label, value, min, max, step = 1, baseline, format = (n) => String(n), onChange }: RangeFieldProps) {
  const pct = (value - min) / (max - min) * 100;
  const basePct = baseline !== undefined ? (baseline - min) / (max - min) * 100 : null;
  const changed = baseline !== undefined && value !== baseline;
  const thumbOffset = (p: number) => `calc(${p}% + ${8 - p * 0.16}px)`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[14px] text-ink">
          {label}
        </label>
        <span className="whitespace-nowrap font-mono text-[13px] tabular-nums">
          {changed && <span className="mr-2 text-ink-3 line-through">{format(baseline as number)}</span>}
          <span className={changed ? 'text-accent' : 'text-ink'}>{format(value)}</span>
        </span>
      </div>
      <div className="relative mt-2 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-line-strong" />
        <div className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-accent" style={{ width: thumbOffset(pct) }} />
        {basePct !== null &&
        <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-3" style={{ left: thumbOffset(basePct) }} aria-hidden />
        }
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range absolute inset-0"
          aria-valuetext={format(value)} />
        
      </div>
    </div>);

}