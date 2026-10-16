import React from 'react';
import { Reveal } from './Reveal';
import { FitReasons } from '../ui/FitReasons';
import { TierBadge } from '../ui/TierBadge';
import { sampleProfile } from '../../data/profile';
import { universities } from '../../data/universities';
import { computeFit, computeScore } from '../../utils/scoring';

export function ProblemSection() {
  const cmu = universities.find((u) => u.id === 'cmu');
  if (!cmu) return null;
  const fit = computeFit(sampleProfile, computeScore(sampleProfile), cmu);

  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-16 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <h2 className="font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[56px]">
            Every admissions tool gives you a number. None of them tell you why.
          </h2>
          <p className="mt-6 max-w-[460px] text-[16px] leading-[1.7] text-ink-2">
            A “moderate chance” doesn’t tell you whether to retake the GRE, chase a publication, or rewrite your SOP. Without the reasoning, a prediction is just a guess with decimals.
          </p>
        </Reveal>

        <div className="flex flex-col gap-4 lg:col-span-6 lg:pt-4">
          <Reveal delay={0.05}>
            <div className="rounded-md border border-line bg-white p-6">
              <p className="text-[12px] text-ink-3">A typical prediction</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="font-display text-[18px] font-medium tracking-[-0.02em]">Carnegie Mellon University</p>
                <p className="text-[14px] text-ink-2">Moderate chance</p>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-line" aria-hidden>
                <div className="h-1.5 w-[45%] rounded-full bg-ink-3" />
              </div>
              <p className="mt-4 text-[13px] text-ink-3">No explanation given.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-md border border-ink bg-white p-6">
              <p className="text-[12px] text-accent">MsAdmit</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="font-display text-[18px] font-medium tracking-[-0.02em]">Carnegie Mellon University</p>
                <TierBadge tier={fit.tier} fit={fit.fit} />
              </div>
              <div className="mt-5">
                <FitReasons reasons={fit.reasons} limit={3} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>);

}