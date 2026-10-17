import React from 'react';
import { ArrowRightIcon, CheckIcon, PlusIcon } from 'lucide-react';
import { FitReasons } from '../ui/FitReasons';
import { RankedUniversity } from '../../types/university';
import { useApplications } from '../../contexts/ApplicationsContext';
import { tierText } from '../../utils/tiers';

interface RecommendationCardProps {
  item: RankedUniversity;
  onOpenBreakdown?: (item: RankedUniversity) => void;
}

export function RecommendationCard({ item, onOpenBreakdown }: RecommendationCardProps) {
  const { addApplication, isTracked } = useApplications();
  const u = item.university;
  const tracked = isTracked(u.id);

  const handleClickBreakdown = () => {
    if (onOpenBreakdown) {
      onOpenBreakdown(item);
    }
  };

  return (
    <article className="group rounded-lg border border-line bg-white p-5 transition-all duration-150 hover:border-line-strong hover:shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={handleClickBreakdown}>
          <h3 className="truncate text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
            {u.name}
          </h3>
          <p className="truncate text-[13px] text-ink-3">
            {u.program} · {u.country}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className={`font-mono text-[24px] font-bold leading-none tabular-nums ${tierText[item.fit.tier]}`}>
            {item.fit.fit}
          </span>
          <p className="mt-1 text-[11px] text-ink-3">fit</p>
        </div>
      </div>

      <div className="mt-4 cursor-pointer" onClick={handleClickBreakdown}>
        <FitReasons reasons={item.fit.reasons} limit={2} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <button
          type="button"
          onClick={handleClickBreakdown}
          className="inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-accent transition-colors duration-150 hover:text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span>Full breakdown</span>
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => addApplication(u.id, u, item.fit.tier, item.fit.fit, item.fit.reasons)}
          disabled={tracked}
          className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            tracked
              ? 'bg-emerald-50 text-emerald-700 font-semibold cursor-default'
              : 'text-ink-2 hover:bg-black/[0.04] hover:text-ink'
          }`}
        >
          {tracked ? <CheckIcon className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <PlusIcon className="h-3.5 w-3.5" aria-hidden />}
          {tracked ? 'Tracking' : 'Track'}
        </button>
      </div>
    </article>
  );
}