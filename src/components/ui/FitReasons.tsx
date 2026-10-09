import React from 'react';
import { FitReason } from '../../types/university';
import { formatSigned } from '../../utils/format';

export function FitReasons({ reasons, limit = 2 }: {reasons: FitReason[];limit?: number;}) {
  return (
    <ul className="space-y-1.5">
      {reasons.slice(0, limit).map((r) =>
      <li key={r.key} className="flex gap-3 text-[13px] leading-snug text-ink-2">
          <span
          className={`w-10 shrink-0 pt-px font-mono text-[12px] tabular-nums ${r.impact >= 0 ? 'text-accent' : 'text-ink-3'}`}>
          
            {formatSigned(r.impact)}
          </span>
          <span>{r.text}</span>
        </li>
      )}
    </ul>);

}