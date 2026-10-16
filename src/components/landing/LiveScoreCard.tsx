import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { ScoreGauge } from '../ui/ScoreGauge';
import { ShapBars } from '../ui/ShapBars';
import { TierBadge } from '../ui/TierBadge';
import { sampleProfile } from '../../data/profile';
import { computeScore, computeShap, countTiers, rankUniversities, tierRank } from '../../utils/scoring';
import { useCountUp } from '../../hooks/useCountUp';

const scenarios = [
{ id: 'current', label: 'Current profile', profile: sampleProfile },
{ id: 'paper', label: '+1 workshop paper', profile: { ...sampleProfile, publications: 1 } }];


export function LiveScoreCard() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const t = window.setInterval(() => setIndex((v) => (v + 1) % scenarios.length), 3600);
    return () => window.clearInterval(t);
  }, [reduce, paused]);

  const profile = scenarios[index].profile;
  const score = computeScore(profile);
  const display = useCountUp(score);
  const factors = computeShap(profile).slice(0, 5);
  const ranked = useMemo(() => rankUniversities(profile), [profile]);
  const counts = countTiers(ranked);

  const change = useMemo(() => {
    const base = rankUniversities(sampleProfile);
    const next = rankUniversities(scenarios[1].profile);
    return next.
    map((n) => ({ n, b: base.find((x) => x.university.id === n.university.id) })).
    filter(({ n, b }) => b && tierRank(n.fit.tier) < tierRank(b.fit.tier)).
    sort((a, b) => a.n.university.rank - b.n.university.rank)[0];
  }, []);

  return (
    <div className="rounded-lg border border-line bg-white p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink">Sample profile</p>
          <p className="text-[12px] text-ink-3">MS Computer Science · Fall 2027</p>
        </div>
        <div role="tablist" aria-label="Scenario" className="flex rounded border border-line p-0.5">
          {scenarios.map((s, i) =>
          <button
            key={s.id}
            role="tab"
            aria-selected={index === i}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
            className={`whitespace-nowrap rounded-sm px-2.5 py-1 text-[12px] transition-colors duration-150 ${index === i ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink'}`}>
            
              {s.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <ScoreGauge value={score} size={148} stroke={8} showTicks={false}>
          <span className="font-mono text-[40px] font-medium leading-none tracking-[-0.04em] tabular-nums">{display}</span>
          <span className="mt-1 font-mono text-[11px] text-ink-3">/ 100</span>
        </ScoreGauge>
        <dl className="grid flex-1 grid-cols-3 gap-3">
          {(['target', 'consider', 'reach'] as const).map((t) =>
          <div key={t}>
              <dt className="text-[12px] capitalize text-ink-3">{t}</dt>
              <dd className="font-mono text-[24px] leading-tight tabular-nums text-ink">{counts[t]}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-6 border-t border-line pt-2">
        <ShapBars size="sm" maxAbs={10} items={factors.map((f) => ({ id: f.key, label: f.label, value: f.value, contribution: f.contribution }))} />
      </div>

      <div className="mt-4 h-8">
        <AnimatePresence mode="wait">
          {index === 1 && change && change.b ?
          <motion.p
            key="change"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
            
              <span className="font-medium text-ink">{change.n.university.name}</span>
              <TierBadge tier={change.b.fit.tier} />
              <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3" aria-hidden />
              <TierBadge tier={change.n.fit.tier} />
            </motion.p> :

          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[13px] text-ink-3">
            
              Every point is attributed to a factor you can act on.
            </motion.p>
          }
        </AnimatePresence>
      </div>
    </div>);

}