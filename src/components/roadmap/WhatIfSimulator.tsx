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
  onChange: (patch: Partial<Profile>) => void;
  onReset: () => void;
}

const levers: {key: keyof Profile;label: string;min: number;max: number;step: number;format?: (n: number) => string;}[] = [
{ key: 'gre', label: 'GRE total', min: 290, max: 340, step: 1 },
{ key: 'publications', label: 'Publications', min: 0, max: 3, step: 1 },
{ key: 'sopQuality', label: 'SOP quality', min: 40, max: 100, step: 1 },
{ key: 'lorStrength', label: 'LOR strength', min: 1, max: 5, step: 1, format: (n) => `${n} / 5` },
{ key: 'workMonths', label: 'Work experience', min: 0, max: 48, step: 1, format: (n) => `${n} mo` },
{ key: 'toefl', label: 'TOEFL', min: 80, max: 120, step: 1 }];


export function WhatIfSimulator({ base, sim, onChange, onReset }: WhatIfSimulatorProps) {
  const baseScore = computeScore(base);
  const simScore = computeScore(sim);
  const display = useCountUp(simScore, 0.5);
  const delta = simScore - baseScore;

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
            <span className={`mt-1 font-mono text-[13px] tabular-nums ${delta > 0 ? 'text-accent' : 'text-ink-3'}`}>{delta === 0 ? 'no change' : `${formatSigned(delta, 0)} vs. now`}</span>
          </ScoreGauge>
          <div className="min-w-[220px] flex-1">
            <p className="text-[12px] text-ink-3">Tier distribution</p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line" aria-hidden>
              {tierOrder.map((t) =>
              <motion.div key={t} className={tierSolid[t]} initial={false} animate={{ width: `${simCounts[t] / total * 100}%` }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
              )}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              {tierOrder.map((t) => {
                const d = simCounts[t] - baseCounts[t];
                return (
                  <div key={t}>
                    <dt className={`text-[12px] ${tierText[t]}`}>{tierLabel[t]}</dt>
                    <dd className="font-mono text-[24px] leading-tight tabular-nums">
                      {simCounts[t]}
                      {d !== 0 && <span className="ml-1.5 text-[12px] text-ink-3">{formatSigned(d, 0)}</span>}
                    </dd>
                  </div>);

              })}
            </dl>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="text-[13px] font-medium">Tier changes</p>
          {changes.length === 0 ?
          <p className="mt-2 text-[14px] text-ink-3">Move a slider to see which programs change tier.</p> :

          <ul className="mt-3 divide-y divide-line">
              {changes.slice(0, 7).map(({ n, o }) =>
            <li key={n.university.id} className="flex flex-wrap items-center gap-2 py-2.5 text-[14px]">
                  <span className="min-w-0 flex-1 truncate">{n.university.name}</span>
                  {o && <TierBadge tier={o.fit.tier} fit={o.fit.fit} />}
                  <ArrowRightIcon className={`h-3.5 w-3.5 ${o && tierRank(n.fit.tier) < tierRank(o.fit.tier) ? 'text-accent' : 'text-ink-3'}`} aria-hidden />
                  <TierBadge tier={n.fit.tier} fit={n.fit.fit} />
                </li>
            )}
              {changes.length > 7 && <li className="py-2.5 text-[13px] text-ink-3">and {changes.length - 7} more</li>}
            </ul>
          }
        </div>
      </div>
    </section>);

}