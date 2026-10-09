import React from 'react';
import { Reveal } from './Reveal';
import { FitReasons } from '../ui/FitReasons';
import { initialProfile } from '../../data/profile';
import { rankUniversities } from '../../utils/scoring';
import { tierDefinition, tierLabel, tierOrder, tierSolid, tierText } from '../../utils/tiers';

export function MatchingSection() {
  const ranked = rankUniversities(initialProfile);

  return (
    <section id="matching" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-16 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal className="lg:sticky lg:top-28">
            <h2 className="font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[48px]">
              Target, Consider, Reach. With the reasoning attached.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.7] text-ink-2">
              Each program is scored against your profile, and every tier comes with the specific factors that put it there, measured in fit points.
            </p>
          </Reveal>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-6 lg:col-span-8">
          {tierOrder.map((tier, ti) => {
            const items = ranked.filter((r) => r.fit.tier === tier).slice(0, 2);
            return (
              <Reveal key={tier} delay={ti * 0.06}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${tierSolid[tier]}`} aria-hidden />
                  <h3 className={`text-[14px] font-medium ${tierText[tier]}`}>{tierLabel[tier]}</h3>
                </div>
                <p className="mt-1 text-[13px] leading-snug text-ink-3">{tierDefinition[tier]}</p>
                <ul className="mt-5 space-y-3">
                  {items.map((r) =>
                  <li key={r.university.id} className="rounded-md border border-line bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium">{r.university.name}</p>
                          <p className="truncate text-[12px] text-ink-3">{r.university.program}</p>
                        </div>
                        <span className={`font-mono text-[20px] leading-none tabular-nums ${tierText[tier]}`}>{r.fit.fit}</span>
                      </div>
                      <div className="mt-4">
                        <FitReasons reasons={r.fit.reasons} limit={2} />
                      </div>
                    </li>
                  )}
                </ul>
              </Reveal>);

          })}
        </div>
      </div>
    </section>);

}