import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, RotateCcwIcon } from 'lucide-react';
import { RangeField } from '../ui/RangeField';
import { TierBadge } from '../ui/TierBadge';
import { ScoreGauge } from '../ui/ScoreGauge';
import { useCountUp } from '../../hooks/useCountUp';
import { Profile } from '../../types/profile';
import { computeScore, countTiers, rankUniversities, tierRank } from '../../utils/scoring';
import { tierLabel, tierOrder, tierSolid, tierText } from '../../utils/tiers';
import { formatSigned } from '../../utils/format';

interface WhatIfSimulatorProps {
  base: Profile;
  sim: Profile;
  currentScore?: number;
  onChange: (patch: Partial<Profile>) => void;
  onReset: () => void;
}

const levers: {key: keyof Profile;label: string;min: number;max: number;step: number;format?: (n: number) => string;}[] = [
  { key: 'gpa', label: 'Undergrad GPA', min: 6.0, max: 10.0, step: 0.1, format: (n) => `${Number(n).toFixed(1)} / 10` },
  { key: 'gre', label: 'GRE total', min: 260, max: 340, step: 1 },
  { key: 'toefl', label: 'TOEFL total', min: 60, max: 120, step: 1 },
  { key: 'publications', label: 'Publications', min: 0, max: 5, step: 1 },
  { key: 'workMonths', label: 'Work experience', min: 0, max: 48, step: 1, format: (n) => n === 0 ? '0 mo' : n >= 12 ? `${(n / 12).toFixed(1)} yrs (${n} mo)` : `${(n / 12).toFixed(2)} yrs (${n} mo)` },
  { key: 'internships', label: 'Internships count', min: 0, max: 6, step: 1, format: (n) => `${n} role${n === 1 ? '' : 's'}` }
];


export function WhatIfSimulator({ base, sim, currentScore, onChange, onReset }: WhatIfSimulatorProps) {
  // Synchronize base score with Dashboard liveScore
  const effectiveBase = currentScore !== undefined && currentScore > 0 ? currentScore : computeScore(base);
  const delta = computeScore(sim) - computeScore(base);
  const simScore = Math.max(1, Math.min(99, Math.round(effectiveBase + delta)));
  const display = useCountUp(simScore, 0.5);

  const { baseCounts, simCounts, changes } = useMemo(() => {
    const b = rankUniversities(base);
    const s = rankUniversities(sim);
    const ch = s.
    map((n) => ({ n, o: b.find((x) => x.university.id === n.university.id) })).
    filter(({ n, o }) => o && n.fit.tier !== o.fit.tier).
    sort((x, y) => x.n.university.rank - y.n.university.rank);
    return { baseCounts: countTiers(b), simCounts: countTiers(s), changes: ch };
  }, [base, sim]);

  const total = simCounts.target + simCounts.consider + simCounts.reach;
  const modified = levers.some((l) => sim[l.key] !== base[l.key]);

  return (
    <section aria-labelledby="whatif-title" className="grid gap-10 rounded-lg border border-line bg-white p-6 md:p-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="flex items-baseline justify-between">
          <h2 id="whatif-title" className="font-display text-[20px] font-semibold tracking-[-0.03em]">
            What-if simulator
          </h2>
          <button
            type="button"
            onClick={onReset}
            disabled={!modified}
            className="inline-flex items-center gap-1.5 rounded-sm text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink disabled:opacity-40">
            
            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
            Reset
          </button>
        </div>
        <p className="mt-2 text-[14px] text-ink-2">The tick marks your current value. Changes here don’t alter your saved profile.</p>
        <div className="mt-8 space-y-6">
          {levers.map((l) =>
          <RangeField
            key={l.key}
            id={`sim-${l.key}`}
            label={l.label}
            value={sim[l.key] as number}
            baseline={base[l.key] as number}
            min={l.min}
            max={l.max}
            step={l.step}
            format={l.format}
            onChange={(v) => onChange({ [l.key]: v } as Partial<Profile>)} />

          )}
        </div>
      </div>

      <div className="border-t border-line pt-8 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        <div className="flex flex-wrap items-center gap-8">
          <ScoreGauge value={simScore} size={180} stroke={9} showTicks={false}>
            <span className="font-mono text-[52px] font-medium leading-none tracking-[-0.04em] tabular-nums" aria-live="polite">
              {display}
            </span>
            <span className={`mt-1 font-mono text-[13px] tabular-nums ${delta > 0 ? 'text-accent font-semibold' : 'text-ink-3'}`}>
              {delta === 0 ? 'Current Profile Score' : `${formatSigned(delta, 0)} pts with simulation`}
            </span>
          </ScoreGauge>
          <div className="min-w-[220px] flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-ink-3 uppercase tracking-wider">Simulated Portfolio</p>
              <span className="text-[11px] text-ink-3">Total: {total} Programs</span>
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line" aria-hidden>
              {tierOrder.map((t) =>
              <motion.div key={t} className={tierSolid[t]} initial={false} animate={{ width: `${simCounts[t] / total * 100}%` }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
              )}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {tierOrder.map((t) => {
                const d = simCounts[t] - baseCounts[t];
                return (
                  <div key={t} className="rounded-lg border border-line bg-canvas/40 p-2.5 text-center">
                    <dt className={`text-[12px] font-semibold ${tierText[t]}`}>{tierLabel[t]}</dt>
                    <dd className="mt-1 font-mono text-[22px] font-bold leading-tight tabular-nums text-ink">
                      {simCounts[t]}
                      {d !== 0 && (
                        <span className={`ml-1 text-[12px] font-semibold ${d > 0 ? 'text-emerald-600' : 'text-ink-3'}`}>
                          {formatSigned(d, 0)}
                        </span>
                      )}
                    </dd>
                    <span className="text-[10px] text-ink-3 block mt-0.5">
                      {t === 'target' ? 'Safe Match' : t === 'consider' ? 'Competitive' : 'Ambitious'}
                    </span>
                  </div>);
              })}
            </dl>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h3 className="font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">
              University Tier Movements
            </h3>
            <span className="text-[12px] text-ink-3">
              Programs upgrading tier (Reach → Consider → Target) based on simulated scores
            </span>
          </div>

          {changes.length === 0 ? (
            <div className="mt-3 rounded-xl border border-line bg-canvas/60 p-4 text-[13px] text-ink-2">
              <p className="font-medium text-ink">Adjust sliders to test program upgrades</p>
              <p className="mt-1 text-ink-3">
                Slide your GRE, GPA, or publications on the left. Any university that improves its admission tier based on your new score will be listed here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11.5px] uppercase tracking-wider font-semibold text-ink-3 px-1">
                <span>University Program</span>
                <span className="text-right">Tier & Fit Transition</span>
              </div>
              <ul className="divide-y divide-line rounded-xl border border-line bg-white shadow-2xs">
                {changes.slice(0, 7).map(({ n, o }) => {
                  const isPromotion = o && tierRank(n.fit.tier) < tierRank(o.fit.tier);
                  const fitDiff = o ? n.fit.fit - o.fit.fit : 0;
                  return (
                    <li
                      key={n.university.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3.5 transition-colors hover:bg-canvas/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-ink">
                            {n.university.name}
                          </span>
                          <span className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-ink-3">
                            Rank #{n.university.rank}
                          </span>
                          {n.university.country && (
                            <span className="text-[12px] text-ink-3">· {n.university.country}</span>
                          )}
                        </div>
                        <p className="mt-1 text-[12.5px] text-ink-2">
                          Admission probability shifts from{' '}
                          <span className="font-mono font-medium">{o?.fit.fit}%</span> to{' '}
                          <span className="font-mono font-medium text-ink">{n.fit.fit}%</span>{' '}
                          {fitDiff > 0 && (
                            <span className="text-accent font-semibold">(+{fitDiff}%)</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {o && <TierBadge tier={o.fit.tier} fit={o.fit.fit} />}
                        <ArrowRightIcon
                          className={`h-4 w-4 ${isPromotion ? 'text-accent' : 'text-ink-3'}`}
                          aria-hidden
                        />
                        <TierBadge tier={n.fit.tier} fit={n.fit.fit} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {changes.length > 7 && (
                <p className="pt-1 text-center text-[12.5px] text-ink-3">
                  + {changes.length - 7} more universities improved their tier
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>);

}