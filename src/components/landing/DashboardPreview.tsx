import React from 'react';
import { ScoreGauge } from '../ui/ScoreGauge';
import { ShapBars } from '../ui/ShapBars';
import { TierBadge } from '../ui/TierBadge';
import { sampleProfile } from '../../data/profile';
import { appNavigation } from '../../data/navigation';
import { computeScore, computeShap, rankUniversities } from '../../utils/scoring';

export function DashboardPreview() {
  const score = computeScore(sampleProfile);
  const factors = computeShap(sampleProfile).slice(0, 6);
  const ranked = rankUniversities(sampleProfile);
  const picks = [ranked[0], ranked[5], ranked[9]].filter(Boolean);

  return (
    <div
      role="img"
      aria-label={`MsAdmit dashboard showing a competitiveness score of ${score} with factor breakdown and university matches`}
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-line bg-white">
      
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </div>
        <span className="font-mono text-[11px] text-ink-3">app.msadmit.com/dashboard</span>
      </div>
      <div className="grid grid-cols-[180px_1fr] max-md:grid-cols-1">
        <div className="border-r border-line bg-canvas p-4 max-md:hidden">
          <p className="font-display text-[14px] font-semibold tracking-[-0.02em]">MsAdmit</p>
          <ul className="mt-6 space-y-1">
            {appNavigation.map((n, i) =>
            <li key={n.to} className={`flex items-center gap-2 rounded px-2 py-1.5 text-[12px] ${i === 0 ? 'bg-white text-ink shadow-[0_0_0_1px_#E8E8E3]' : 'text-ink-3'}`}>
                <n.icon className={`h-3.5 w-3.5 ${i === 0 ? 'text-accent' : ''}`} strokeWidth={1.75} />
                {n.label}
              </li>
            )}
          </ul>
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-12 md:p-8">
          <div className="flex flex-col items-start md:col-span-4">
            <p className="text-[12px] text-ink-3">Competitiveness</p>
            <ScoreGauge value={score} size={168} stroke={8} className="mt-3">
              <span className="font-mono text-[44px] leading-none tracking-[-0.04em]">{score}</span>
              <span className="mt-1 font-mono text-[11px] text-ink-3">/ 100</span>
            </ScoreGauge>
            <ul className="mt-6 w-full space-y-3">
              {picks.map((r) =>
              <li key={r.university.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] text-ink">{r.university.name}</span>
                  <TierBadge tier={r.fit.tier} fit={r.fit.fit} />
                </li>
              )}
            </ul>
          </div>
          <div className="md:col-span-8">
            <p className="text-[12px] text-ink-3">What’s driving your score</p>
            <div className="mt-2">
              <ShapBars size="sm" maxAbs={8} items={factors.map((f) => ({ id: f.key, label: f.label, value: f.value, contribution: f.contribution }))} />
            </div>
          </div>
        </div>
      </div>
    </div>);

}