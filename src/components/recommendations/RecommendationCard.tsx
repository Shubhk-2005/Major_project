import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, PlusIcon } from 'lucide-react';
import { FitReasons } from '../ui/FitReasons';
import { ShapBars } from '../ui/ShapBars';
import { RankedUniversity } from '../../types/university';
import { useApplications } from '../../contexts/ApplicationsContext';
import { tierText } from '../../utils/tiers';

export function RecommendationCard({ item }: {item: RankedUniversity;}) {
  const [open, setOpen] = useState(false);
  const { addApplication, isTracked } = useApplications();
  const u = item.university;
  const tracked = isTracked(u.id);

  return (
    <article className="rounded-md border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">{u.name}</h3>
          <p className="truncate text-[13px] text-ink-3">
            {u.program} · {u.country}
          </p>
        </div>
        <div className="text-right">
          <span className={`font-mono text-[24px] leading-none tabular-nums ${tierText[item.fit.tier]}`}>{item.fit.fit}</span>
          <p className="mt-1 text-[11px] text-ink-3">fit</p>
        </div>
      </div>
      <div className="mt-4">
        <FitReasons reasons={item.fit.reasons} limit={2} />
      </div>
      <AnimatePresence initial={false}>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden">
          
            <div className="mt-4 border-t border-line pt-1">
              <ShapBars size="sm" maxAbs={20} items={item.fit.reasons.map((r) => ({ id: r.key, label: r.label, contribution: r.impact }))} />
            </div>
          </motion.div>
        }
      </AnimatePresence>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded-sm text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          
          Full breakdown
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => addApplication(u.id)}
          disabled={tracked}
          className="inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:text-ink-3">
          
          {tracked ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <PlusIcon className="h-3.5 w-3.5" aria-hidden />}
          {tracked ? 'Tracking' : 'Track'}
        </button>
      </div>
    </article>);

}