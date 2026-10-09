import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatSigned } from '../../utils/format';

export interface ShapBarItem {
  id: string;
  label: string;
  value?: string;
  contribution: number;
  explanation?: string;
}

interface ShapBarsProps {
  items: ShapBarItem[];
  maxAbs?: number;
  showExplanations?: boolean;
  size?: 'md' | 'sm';
}

export function ShapBars({ items, maxAbs, showExplanations = false, size = 'md' }: ShapBarsProps) {
  const reduce = useReducedMotion();
  const max = maxAbs ?? Math.max(4, ...items.map((i) => Math.abs(i.contribution)));

  return (
    <ul className="divide-y divide-line">
      {items.map((it, i) => {
        const pos = it.contribution >= 0;
        const w = Math.min(Math.abs(it.contribution), max) / max * 50;
        return (
          <li
            key={it.id}
            className={`grid grid-cols-[minmax(0,1.1fr)_minmax(96px,1fr)_52px] items-center gap-4 ${size === 'md' ? 'py-4' : 'py-2.5'}`}>
            
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`truncate font-medium text-ink ${size === 'md' ? 'text-[14px]' : 'text-[13px]'}`}>{it.label}</span>
                {it.value && <span className="truncate whitespace-nowrap font-mono text-[12px] text-ink-3">{it.value}</span>}
              </div>
              {showExplanations && it.explanation &&
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{it.explanation}</p>
              }
            </div>
            <div className="relative h-2" aria-hidden>
              <div className="absolute -bottom-1.5 -top-1.5 left-1/2 w-px bg-line-strong" />
              <motion.div
                className={`absolute top-0 h-2 ${pos ? 'rounded-r-sm bg-accent' : 'rounded-l-sm bg-neg'}`}
                style={{ originX: pos ? 0 : 1 }}
                initial={{ scaleX: reduce ? 1 : 0, left: pos ? '50%' : `${50 - w}%`, width: `${w}%` }}
                animate={{ scaleX: 1, left: pos ? '50%' : `${50 - w}%`, width: `${w}%` }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : Math.min(i * 0.04, 0.3), ease: [0.23, 1, 0.32, 1] }} />
              
            </div>
            <span className={`text-right font-mono text-[13px] tabular-nums ${pos ? 'text-accent' : 'text-ink-2'}`}>
              {formatSigned(it.contribution)}
            </span>
          </li>);

      })}
    </ul>);

}