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
import { BASELINE, countTiers, scoreDelta } from '../utils/scoring';
import { daysUntil, formatSigned } from '../utils/format';

export function Dashboard() {
  const { profile, score, factors, ranked, isOnboarded } = useProfile();
  const { applications } = useApplications();
  const display = useCountUp(score);
  const counts = countTiers(ranked);

  const adding = factors.filter((f) => f.contribution > 0).reduce((a, f) => a + f.contribution, 0);
  const costing = factors.filter((f) => f.contribution < 0).reduce((a, f) => a + f.contribution, 0);

  const levers = roadmapItems
    .filter((r) => r.lever)
    .map((r) => ({ item: r, delta: scoreDelta(profile, r.lever ?? {}) }))
    .sort((a, b) => b.delta - a.delta);
  const topLever = levers[0];

  const upcoming = applications
    .filter((a) => a.stage === 'shortlisted' || a.stage === 'preparing')
    .map((a) => ({
      a,
      days: daysUntil(a.deadline),
      uni: universities.find((u) => u.id === a.universityId) || (a.universityName ? { name: a.universityName } : undefined)
    }))
    .sort((x, y) => x.days - y.days)[0];

  const topMatches = [...ranked].sort((a, b) => b.fit.fit - a.fit.fit).slice(0, 3);

  const modules = [
    { to: '/app/recommendations', label: 'Recommendations', summary: `${counts.target} Target · ${counts.consider} Consider · ${counts.reach} Reach` },
    { to: '/app/roadmap', label: 'What If ?? Simulator', summary: 'Simulate score boosts & review Ms AI strategic roadmap actions' },
    { to: '/app/qs-rankings', label: 'QS Top 150 Rankings', summary: 'Explore admission medians, tuition fees, and employer scores' },
    { to: '/app/tracker', label: 'Application tracker', summary: upcoming?.uni ? `${applications.length} applications · ${upcoming.uni.name} due in ${upcoming.days} days` : `${applications.length} applications` },
    {
      to: '/app/documents?tab=sop',
      label: 'Documents & SOP feedback',
      summary:
        profile.sopQuality && profile.sopQuality !== 60
          ? `SOP scored ${Math.round(profile.sopQuality)}/100 · Evaluated by Ms AI`
          : 'Upload draft SOP for 8-criteria critique powered by Ms AI'
    }
  ];

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Applicant';

  return (
    <div className="space-y-12">
      {!isOnboarded && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-[12px] font-medium text-accent">
              Profile Incomplete
            </span>
            <h2 className="mt-2 font-display text-[22px] font-semibold text-ink">
              Welcome, {firstName}! Complete your applicant profile
            </h2>
            <p className="mt-1 text-[14px] text-ink-2 max-w-[580px] leading-relaxed">
              Upload your resume and enter your undergraduate metrics. Your work experience, research papers, and internships will be automatically extracted to calculate your verified competitiveness score.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="shrink-0 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-[14px] font-medium text-canvas transition-opacity hover:opacity-90 shadow-sm"
          >
            Start Onboarding <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Hero Section: Competitiveness Gauge & What's Driving Your Score */}
      <section className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col items-center lg:items-start lg:col-span-5 lg:sticky lg:top-8">
          <ScoreGauge value={isOnboarded ? score : 0} size={300} stroke={12}>
            <span className="text-[13px] text-ink-3">Competitiveness</span>
            <span className="mt-1 font-mono text-[88px] font-medium leading-none tracking-[-0.05em] tabular-nums text-ink" aria-label={`Score ${score} out of 100`}>
              {isOnboarded ? display : '--'}
            </span>
            <span className="mt-2 font-mono text-[13px] text-ink-3">
              {isOnboarded ? 'out of 100' : 'Pending onboarding'}
            </span>
          </ScoreGauge>

          {/* User profile & headline placed below the score gauge */}
          <div className="mt-6 text-center lg:text-left w-full max-w-[380px]">
            <p className="text-[14px] font-medium text-ink-3">
              {firstName}, {profile.targetProgram || 'MS Computer Science'} · {profile.intake || 'Fall 2027'}
            </p>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-ink md:text-[32px]">
              {isOnboarded
                ? `Competitive for ${counts.target} programs, within reach of ${counts.consider} more.`
                : 'Complete your profile to unlock personalized university admissions predictions.'}
            </h1>

            {/* Compact Baseline / Adding / Costing Summary */}
            <div className="mt-5 rounded-xl border border-line bg-white/90 p-4 shadow-2xs">
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="border-r border-line/60 pr-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Baseline</dt>
                  <dd className="mt-1 font-mono text-[19px] font-bold tabular-nums text-ink">{BASELINE}</dd>
                </div>
                <div className="border-r border-line/60 px-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-accent">Adding</dt>
                  <dd className="mt-1 font-mono text-[19px] font-bold tabular-nums text-accent">{formatSigned(adding)}</dd>
                </div>
                <div className="pl-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-2">Costing</dt>
                  <dd className="mt-1 font-mono text-[19px] font-bold tabular-nums text-ink-2">{formatSigned(costing)}</dd>
                </div>
              </dl>

              {/* Short Explanation */}
              <div className="mt-3 pt-3 border-t border-line/70 space-y-1.5 text-[12px] text-ink-2">
                <p className="leading-snug">
                  • <strong className="text-ink">Baseline ({BASELINE}):</strong> Starting benchmark for typical MS CS applicants.
                </p>
                <p className="leading-snug">
                  • <strong className="text-accent">Adding ({formatSigned(adding)}):</strong> Points gained from your profile strengths (e.g. GPA).
                </p>
                <p className="leading-snug">
                  • <strong className="text-ink-2">Costing ({formatSigned(costing)}):</strong> Deductions for lower test scores or un-uploaded documents.
                </p>
                <p className="mt-2 pt-2 border-t border-line/50 font-mono text-[11.5px] text-ink-3">
                  {BASELINE} + {formatSigned(adding)} {formatSigned(costing)} = <strong className="text-ink">{score} pts (Your Score)</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* What’s driving your score section shifted directly upwards to the top */}
          <div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
                What’s driving your score
              </h2>
              <span className="text-[12px] text-ink-3">Points vs. baseline</span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              Blue bars add points. Gray bars subtract. Contributions sum directly to your competitiveness score.
            </p>
            <div className="mt-4 rounded-xl border border-line bg-white px-5 py-2 shadow-2xs">
              <ShapBars
                items={factors.map((f) => ({
                  id: f.key,
                  label: f.label,
                  value: f.value,
                  contribution: f.contribution,
                  explanation: f.explanation
                }))}
                showExplanations
                size="sm"
                maxAbs={8}
              />
            </div>
          </div>

          {topLever && topLever.delta > 0 && (
            <Link
              to="/app/roadmap"
              className="group mt-6 flex items-center justify-between gap-4 rounded-md border border-line bg-white px-5 py-4 transition-colors duration-150 hover:border-line-strong"
            >
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
          )}
        </div>
      </section>

      {/* Strongest Matches Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">
              Strongest matches
            </h2>
            <p className="mt-1 text-[14px] text-ink-2">
              Top fit programs, with the decisive factor deciding your classification.
            </p>
          </div>
          <Link
            to="/app/recommendations"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent underline-offset-4 hover:underline self-start sm:self-auto"
          >
            All recommendations
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topMatches.map((r) => (
            <div
              key={r.university.id}
              className="flex flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-2xs hover:border-line-strong transition-all duration-150"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold text-ink">{r.university.name}</p>
                    <p className="truncate text-[13px] text-ink-3">{r.university.program}</p>
                  </div>
                  <TierBadge tier={r.fit.tier} fit={r.fit.fit} />
                </div>
                <div className="mt-4">
                  <FitReasons reasons={r.fit.reasons} limit={1} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-[12px] text-ink-3">
                <span className="font-mono font-medium">QS Rank #{r.university.rank}</span>
                <Link
                  to="/app/recommendations"
                  className="font-medium text-accent hover:underline inline-flex items-center gap-1"
                >
                  View full breakdown <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Your Workspace Modules Section */}
      <section>
        <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">Your workspace</h2>
        <ul className="mt-6 border-t border-line">
          {modules.map((m) => (
            <li key={m.to} className="border-b border-line">
              <Link
                to={m.to}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 px-2 py-5 transition-colors duration-150 hover:bg-white md:grid-cols-[280px_1fr_auto]"
              >
                <span className="font-display text-[17px] font-medium tracking-[-0.02em]">{m.label}</span>
                <span className="col-span-2 row-start-2 text-[14px] text-ink-2 md:col-span-1 md:row-start-auto">{m.summary}</span>
                <ArrowUpRightIcon className="h-4 w-4 text-ink-3 transition-colors duration-150 group-hover:text-accent" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}