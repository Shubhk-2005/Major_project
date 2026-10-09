import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { ShapBars } from '../components/ui/ShapBars';
import { TierBadge } from '../components/ui/TierBadge';
import { FitReasons } from '../components/ui/FitReasons';
import { useProfile } from '../contexts/ProfileContext';
import { useApplications } from '../contexts/ApplicationsContext';
import { useCountUp } from '../hooks/useCountUp';
import { roadmapItems } from '../data/roadmap';
import { universities } from '../data/universities';
import { sopSegments } from '../data/sop';
import { BASELINE, countTiers, percentileFor, scoreDelta } from '../utils/scoring';
import { daysUntil, formatSigned } from '../utils/format';

export function Dashboard() {
  const { profile, score, factors, ranked, sopDecisions } = useProfile();
  const { applications } = useApplications();
  const display = useCountUp(score);
  const counts = countTiers(ranked);
  const pct = percentileFor(score);

  const adding = factors.filter((f) => f.contribution > 0).reduce((a, f) => a + f.contribution, 0);
  const costing = factors.filter((f) => f.contribution < 0).reduce((a, f) => a + f.contribution, 0);

  const levers = roadmapItems.
  filter((r) => r.lever).
  map((r) => ({ item: r, delta: scoreDelta(profile, r.lever ?? {}) })).
  sort((a, b) => b.delta - a.delta);
  const topLever = levers[0];

  const upcoming = applications.
  filter((a) => a.stage === 'shortlisted' || a.stage === 'preparing').
  map((a) => ({ a, days: daysUntil(a.deadline), uni: universities.find((u) => u.id === a.universityId) })).
  sort((x, y) => x.days - y.days)[0];

  const openSuggestions = sopSegments.filter((s) => s.suggestion && !sopDecisions[s.id]).length;
  const countries = new Set(universities.map((u) => u.country)).size;
  const topMatches = ranked.slice(0, 3);

  const modules = [
  { to: '/app/recommendations', label: 'Recommendations', summary: `${counts.target} Target · ${counts.consider} Consider · ${counts.reach} Reach` },
  { to: '/app/explorer', label: 'University explorer', summary: `${universities.length} programs across ${countries} countries, with admit statistics` },
  { to: '/app/tracker', label: 'Application tracker', summary: upcoming?.uni ? `${applications.length} applications · ${upcoming.uni.name} due in ${upcoming.days} days` : `${applications.length} applications` },
  { to: '/app/documents?tab=sop', label: 'Documents & SOP feedback', summary: `SOP scored ${Math.round(profile.sopQuality)}/100 · ${openSuggestions} suggestion${openSuggestions === 1 ? '' : 's'} open` },
  { to: '/app/roadmap', label: 'Roadmap & simulator', summary: `${roadmapItems.filter((r) => r.start === 0).length} actions start in October` }];


  const firstName = profile.name.split(' ')[0];

  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex justify-center lg:col-span-5 lg:justify-start">
          <ScoreGauge value={score} size={300} stroke={12}>
            <span className="text-[13px] text-ink-3">Competitiveness</span>
            <span className="mt-1 font-mono text-[88px] font-medium leading-none tracking-[-0.05em] tabular-nums text-ink" aria-label={`Score ${score} out of 100`}>
              {display}
            </span>
            <span className="mt-2 font-mono text-[13px] text-ink-3">/ 100 · {pct}th percentile</span>
          </ScoreGauge>
        </div>
        <div className="lg:col-span-7">
          <p className="text-[14px] text-ink-3">
            {firstName}, {profile.targetProgram} · {profile.intake}
          </p>
          <h1 className="mt-3 font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[48px]">
            Competitive for {counts.target} programs, within reach of {counts.consider} more.
          </h1>
          <p className="mt-5 max-w-[560px] text-[16px] leading-[1.65] text-ink-2">
            You score higher than {pct}% of applicants targeting this program. The breakdown below shows exactly which parts of your profile add points and which cost them, relative to a baseline applicant at {BASELINE}.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
            <div>
              <dt className="text-[12px] text-ink-3">Baseline</dt>
              <dd className="font-mono text-[20px] tabular-nums">{BASELINE}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-ink-3">Adding</dt>
              <dd className="font-mono text-[20px] tabular-nums text-accent">{formatSigned(adding)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-ink-3">Costing</dt>
              <dd className="font-mono text-[20px] tabular-nums text-ink-2">{formatSigned(costing)}</dd>
            </div>
          </dl>
          {topLever && topLever.delta > 0 &&
          <Link
            to="/app/roadmap"
            className="group mt-8 flex items-center justify-between gap-4 rounded-md border border-line bg-white px-5 py-4 transition-colors duration-150 hover:border-line-strong">
            
              <div className="min-w-0">
                <p className="text-[12px] text-ink-3">Biggest lever</p>
                <p className="truncate text-[15px] font-medium">{topLever.item.title}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-[15px] tabular-nums text-accent">
                  +{topLever.delta} → {score + topLever.delta}
                </span>
                <ArrowRightIcon className="h-4 w-4 text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>
          }
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em]">What’s driving your score</h2>
            <span className="hidden text-[12px] text-ink-3 sm:inline">Points vs. baseline</span>
          </div>
          <p className="mt-2 max-w-[560px] text-[14px] leading-relaxed text-ink-2">Blue bars add points. Gray bars subtract. Contributions sum exactly to your score.</p>
          <div className="mt-6 rounded-lg border border-line bg-white px-6 py-2">
            <ShapBars items={factors.map((f) => ({ id: f.key, label: f.label, value: f.value, contribution: f.contribution, explanation: f.explanation }))} showExplanations maxAbs={8} />
          </div>
        </div>

        <aside className="lg:col-span-4">
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Strongest matches</h2>
          <p className="mt-2 text-[14px] text-ink-2">Top fit, with the factor that decides it.</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {topMatches.map((r) =>
            <li key={r.university.id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{r.university.name}</p>
                    <p className="truncate text-[13px] text-ink-3">{r.university.program}</p>
                  </div>
                  <TierBadge tier={r.fit.tier} fit={r.fit.fit} />
                </div>
                <div className="mt-3">
                  <FitReasons reasons={r.fit.reasons} limit={1} />
                </div>
              </li>
            )}
          </ul>
          <Link to="/app/recommendations" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent underline-offset-4 hover:underline">
            All recommendations
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </aside>
      </section>

      <section>
        <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em]">Your workspace</h2>
        <ul className="mt-6 border-t border-line">
          {modules.map((m) =>
          <li key={m.to} className="border-b border-line">
              <Link
              to={m.to}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 px-2 py-5 transition-colors duration-150 hover:bg-white md:grid-cols-[280px_1fr_auto]">
              
                <span className="font-display text-[17px] font-medium tracking-[-0.02em]">{m.label}</span>
                <span className="col-span-2 row-start-2 text-[14px] text-ink-2 md:col-span-1 md:row-start-auto">{m.summary}</span>
                <ArrowUpRightIcon className="h-4 w-4 text-ink-3 transition-colors duration-150 group-hover:text-accent" aria-hidden />
              </Link>
            </li>
          )}
        </ul>
      </section>
    </div>);

}