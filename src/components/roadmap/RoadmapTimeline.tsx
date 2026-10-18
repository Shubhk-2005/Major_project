import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Profile } from '../../types/profile';
import { Priority } from '../../types/roadmap';
import { RankedUniversity } from '../../types/university';
import { scoreDelta } from '../../utils/scoring';
import { Button } from '../ui/Button';
import { getDynamicMonths, getDynamicRoadmapItems } from '../../utils/roadmapGenerator';

interface RoadmapTimelineProps {
  base: Profile;
  ranked?: RankedUniversity[];
  aiStrategy?: any;
  onSimulate: (lever: Partial<Profile>) => void;
}

const barStyle: Record<Priority, string> = {
  high: 'bg-accent text-white',
  medium: 'bg-ink/80 text-white',
  low: 'border border-line-strong bg-white text-ink-2',
};

const priorityLabel: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function RoadmapTimeline({ base, ranked = [], aiStrategy, onSimulate }: RoadmapTimelineProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const months = useMemo(() => getDynamicMonths(), []);
  const items = useMemo(() => getDynamicRoadmapItems(base, ranked, aiStrategy), [base, ranked, aiStrategy]);

  return (
    <section aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 id="timeline-title" className="font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">
            Next 12-Month Action Plan
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-3">
            Timeline synthesized dynamically from your current profile, test gaps, and target university cutoffs.
          </p>
        </div>

        <div className="flex items-center gap-5 text-[12px] text-ink-3">
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-4 rounded-sm ${barStyle[p]}`} aria-hidden />
              {priorityLabel[p]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white shadow-2xs">
        <div className="min-w-[980px]">
          {/* Header row with dynamic months */}
          <div className="grid grid-cols-[280px_1fr] border-b border-line bg-canvas/40">
            <div className="px-5 py-3 text-[12px] font-medium text-ink-3">Strategic Action</div>
            <div className="grid grid-cols-12">
              {months.map((m, i) => (
                <div
                  key={`${m.name}-${i}`}
                  className="border-l border-line px-2 py-3 font-mono text-[11px] text-ink-3 flex items-baseline justify-center gap-0.5"
                >
                  <span className="font-medium text-ink">{m.name}</span>
                  {(i === 0 || m.name === 'Jan') && (
                    <span className="text-[10px] text-ink-3 font-semibold">'{m.year}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action item rows */}
          <ul>
            {items.map((item) => {
              const delta = item.lever ? scoreDelta(base, item.lever) : 0;
              const open = openId === item.id;
              return (
                <li key={item.id} className="border-b border-line last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="grid w-full grid-cols-[280px_1fr] text-left transition-colors duration-150 hover:bg-canvas/60 focus-visible:bg-canvas focus-visible:outline-none"
                  >
                    <div className="min-w-0 px-5 py-3.5">
                      <p className="truncate text-[14px] font-medium text-ink">{item.title}</p>
                      <p className="font-mono text-[12px] text-ink-3">
                        {item.lever ? (
                          delta > 0 ? (
                            <span className="text-accent font-semibold">+{delta} pts lift</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">benchmark met</span>
                          )
                        ) : (
                          'application strategy'
                        )}
                        {' · '}
                        {priorityLabel[item.priority].toLowerCase()} priority
                      </p>
                    </div>

                    <div className="relative grid grid-cols-12 items-center">
                      {months.map((m, idx) => (
                        <div key={`${m.name}-${idx}`} className="h-full border-l border-line" aria-hidden />
                      ))}
                      <motion.div
                        className={`absolute top-1/2 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-sm px-2.5 text-[12px] shadow-2xs ${barStyle[item.priority]}`}
                        style={{
                          left: `calc(${(item.start / 12) * 100}% + 4px)`,
                          width: `calc(${(item.span / 12) * 100}% - 8px)`,
                          originX: 0,
                        }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <span className="truncate font-mono">
                          {months[item.start]?.name}
                          {item.span > 1
                            ? `–${months[Math.min(item.start + item.span - 1, 11)]?.name}`
                            : ''}
                        </span>
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 bg-canvas/70 px-5 py-4 border-t border-line/50 md:flex-row md:items-center md:justify-between">
                          <p className="max-w-[640px] text-[14px] leading-relaxed text-ink-2">
                            {item.detail}
                          </p>
                          {item.lever && delta > 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onSimulate(item.lever ?? {})}
                              className="shrink-0"
                            >
                              Simulate in What-If (+{delta})
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}