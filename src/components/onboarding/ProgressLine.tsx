import React from 'react';
import { motion } from 'framer-motion';

interface ProgressLineProps {
  steps: readonly string[];
  current: number;
  onStepClick: (i: number) => void;
}

export function ProgressLine({ steps, current, onStepClick }: ProgressLineProps) {
  return (
    <nav aria-label="Profile progress">
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onStepClick(i)}
                aria-current={active ? 'step' : undefined}
                className="group w-full text-left focus-visible:outline-none disabled:cursor-default">
                
                <span className="relative block h-[2px] overflow-hidden bg-line-strong">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-ink"
                    initial={false}
                    animate={{ width: done ? '100%' : active ? '40%' : '0%' }}
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }} />
                  
                </span>
                <span
                  className={`mt-3 block truncate text-[13px] transition-colors duration-150 group-focus-visible:underline ${active ? 'font-medium text-ink' : done ? 'text-ink-2 group-hover:text-ink' : 'text-ink-3'}`}>
                  
                  {label}
                </span>
              </button>
            </li>);

        })}
      </ol>
    </nav>);

}