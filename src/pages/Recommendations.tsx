import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { TierBadge } from '../components/ui/TierBadge';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { useProfile } from '../contexts/ProfileContext';
import { getDynamicRoadmapItems } from '../utils/roadmapGenerator';
import { applyLever, computeScore, countTiers, rankUniversities, tierRank, getScoreExplanation } from '../utils/scoring';
import { tierDefinition, tierLabel, tierOrder, tierSolid, tierText } from '../utils/tiers';
import { Tier, RankedUniversity } from '../types/university';

import { RecommendationDrawer } from '../components/recommendations/RecommendationDrawer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

const PORTFOLIO: Record<Tier, number> = { target: 3, consider: 4, reach: 2 };
const INITIAL_VISIBLE = 5;

export function Recommendations() {
  const { profile, score, ranked } = useProfile();
  const counts = countTiers(ranked);
  const scoreMeaning = getScoreExplanation(score);
  const [expanded, setExpanded] = useState<Record<Tier, boolean>>({ target: false, consider: false, reach: false });
  const [selectedUni, setSelectedUni] = useState<RankedUniversity | null>(null);

  const unlock = useMemo(() => {
    const dynItems = getDynamicRoadmapItems(profile, ranked);
    const high = dynItems.filter((r) => r.priority === 'high' && r.lever);
    const boosted = high.reduce((p, r) => applyLever(p, r.lever ?? {}), profile);
    const boostedRanked = rankUniversities(boosted);
    const moves = boostedRanked.
    map((b) => ({ b, cur: ranked.find((r) => r.university.id === b.university.id) })).
    filter(({ b, cur }) => cur && tierRank(b.fit.tier) < tierRank(cur.fit.tier));
    return { count: high.length, score: computeScore(boosted), moves };
  }, [profile, ranked]);

  const portfolio = tierOrder.map((t) => ({ tier: t, n: Math.min(PORTFOLIO[t], counts[t]) }));

  return (
    <div>
      <PageHeader
        title="Recommendations"
        description="Every program is tiered by fit, and every tier shows the factors behind it. Fit is computed from your score, each program’s admit bar, and how you compare to its admitted medians." />
      

      <section className="mt-10 grid gap-8 rounded-lg border border-line bg-white p-6 md:p-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em]">Application strategy</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${scoreMeaning.badgeClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${scoreMeaning.dotClass}`} />
              Score {score}: {scoreMeaning.label}
            </span>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
            {scoreMeaning.oneLiner}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
            Anchor your list with Targets, spend most effort on Considers, and reserve Reaches for institutions where your profile roadmap levers create positive movement.
          </p>
          <div className="mt-5 flex flex-wrap gap-6">
            {portfolio.map((p) =>
            <div key={p.tier}>
                <p className={`font-mono text-[28px] leading-none tabular-nums ${tierText[p.tier]}`}>{p.n}</p>
                <p className="mt-1 text-[12px] text-ink-3">{tierLabel[p.tier]}</p>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-line pt-6 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[13px] text-ink-3">If you complete your {unlock.count} high-priority roadmap actions</p>
          <p className="mt-1 font-mono text-[15px] tabular-nums">
            Score {score} <span className="text-ink-3">→</span> <span className="text-accent">{unlock.score}</span>
          </p>
          {unlock.moves.length > 0 ?
          <ul className="mt-4 space-y-2">
              {unlock.moves.slice(0, 4).map(({ b, cur }) =>
            <li key={b.university.id} className="flex flex-wrap items-center gap-2 text-[14px]">
                  <span className="min-w-0 flex-1 truncate">{b.university.name}</span>
                  {cur && <TierBadge tier={cur.fit.tier} />}
                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3" aria-hidden />
                  <TierBadge tier={b.fit.tier} />
                </li>
            )}
              {unlock.moves.length > 4 && <li className="text-[13px] text-ink-3">and {unlock.moves.length - 4} more</li>}
            </ul> :

          <p className="mt-4 text-[14px] text-ink-2">Your tiers are already at their ceiling for these actions.</p>
          }
          <Link to="/app/roadmap" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent underline-offset-4 hover:underline">
            Open What If ??
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-6">
        {tierOrder.map((tier) => {
          const items = ranked
            .filter((r) => r.fit.tier === tier)
            .sort((a, b) => b.fit.fit - a.fit.fit);
          const visible = expanded[tier] ? items : items.slice(0, INITIAL_VISIBLE);
          return (
            <section key={tier} aria-labelledby={`tier-${tier}`}>
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <h2 id={`tier-${tier}`} className="flex items-center gap-2 font-display text-[18px] font-semibold tracking-[-0.02em]">
                  <span className={`h-2 w-2 rounded-full ${tierSolid[tier]}`} aria-hidden />
                  {tierLabel[tier]}
                </h2>
                <span className="font-mono text-[13px] tabular-nums text-ink-3">{items.length}</span>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-ink-3">{tierDefinition[tier]}</p>
              <div className="mt-5 space-y-3">
                {visible.map((r) =>
                <RecommendationCard key={r.university.id} item={r} onOpenBreakdown={setSelectedUni} />
                )}
                {items.length === 0 && <p className="rounded-md border border-dashed border-line-strong px-4 py-8 text-center text-[14px] text-ink-3">No programs in this tier right now.</p>}
              </div>
              {items.length > INITIAL_VISIBLE &&
              <button
                type="button"
                onClick={() => setExpanded((e) => ({ ...e, [tier]: !e[tier] }))}
                className="mt-4 rounded-sm text-[13px] font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                
                  {expanded[tier] ? 'Show fewer' : `Show all ${items.length}`}
                </button>
              }
            </section>);

        })}
      </div>

      {/* University Full Breakdown Slide-Over Drawer */}
      <ErrorBoundary fallbackTitle="Could not load university breakdown" onReset={() => setSelectedUni(null)}>
        <RecommendationDrawer item={selectedUni} onClose={() => setSelectedUni(null)} />
      </ErrorBoundary>
    </div>);

}