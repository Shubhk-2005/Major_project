import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  XIcon,
  CheckIcon,
  PlusIcon,
  CopyIcon,
  SparklesIcon,
  GlobeIcon,
  DollarSignIcon,
  CalendarIcon,
  GraduationCapIcon,
  BookOpenIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  BarChart3Icon,
  AwardIcon,
  LayersIcon,
  ChevronRightIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ShapBars } from '../ui/ShapBars';
import { TierBadge } from '../ui/TierBadge';
import { RankedUniversity } from '../../types/university';
import { outcomes } from '../../data/outcomes';
import { useProfile } from '../../contexts/ProfileContext';
import { useApplications } from '../../contexts/ApplicationsContext';
import { formatDate, formatUSD } from '../../utils/format';
import { tierLabel, tierText } from '../../utils/tiers';

interface RecommendationDrawerProps {
  item: RankedUniversity | null;
  onClose: () => void;
}

export function RecommendationDrawer({ item, onClose }: RecommendationDrawerProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { profile } = useProfile();
  const { addApplication, isTracked } = useApplications();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  const u = item.university;
  const tracked = isTracked(u.id);
  const similar = (outcomes || []).filter(
    (o) => o && (o.universityId === u.id || o.universityId === u.id.replace(/-/g, ''))
  );

  const acceptanceDisplay =
    typeof u.acceptance === 'number' && !isNaN(u.acceptance)
      ? u.acceptance <= 1
        ? `${Math.round(u.acceptance * 100)}%`
        : `${Math.round(u.acceptance)}%`
      : '20%';
  const avgGpaDisplay = typeof u.avgGpa === 'number' && !isNaN(u.avgGpa) ? u.avgGpa.toFixed(1) : '8.5';

  const handleCopy = () => {
    const text = [
      `University: ${u.name}`,
      `Program: ${u.program} (${u.city}, ${u.country})`,
      `Fit Classification: ${tierLabel[item.fit.tier]} (${item.fit.fit}% Fit Score)`,
      `QS CS Rank: #${u.rank} | Acceptance Rate: ${acceptanceDisplay}`,
      `Admitted Medians: GPA ${avgGpaDisplay}/10, GRE ${u.avgGre || 320}, TOEFL ${u.avgToefl || 100}`,
      `Annual Tuition: ${formatUSD(u.tuition || 0)} | Living: ${formatUSD(u.living || 0)}`,
      `Deadline: ${formatDate(u.deadline, 'MMM d, yyyy')}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gpaDelta = profile.gpa > 0 && typeof u.avgGpa === 'number' ? profile.gpa - u.avgGpa : 0;
  const greDelta = profile.gre > 0 && typeof u.avgGre === 'number' ? profile.gre - u.avgGre : 0;
  const toeflDelta = profile.toefl > 0 && typeof u.avgToefl === 'number' ? profile.toefl - u.avgToefl : 0;

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Right Slide-over Sheet */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="rec-drawer-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[580px] flex-col border-l border-line bg-canvas shadow-2xl"
            initial={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line bg-white px-6 py-5 md:px-8">
              <div className="min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={item.fit.tier} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-2">
                    QS Rank #{u.rank}
                  </span>
                  <span className={`font-mono text-[12px] font-bold ${tierText[item.fit.tier]}`}>
                    {item.fit.fit}% Fit Score
                  </span>
                </div>
                <h2
                  id="rec-drawer-title"
                  className="mt-2 font-display text-[22px] font-bold leading-tight tracking-[-0.03em] text-ink"
                >
                  {u.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-2">
                  <GlobeIcon className="h-3.5 w-3.5 text-ink-3 shrink-0" />
                  {u.program} · {u.city}, {u.country}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy university details"
                  aria-label="Copy university details"
                  className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-black/[0.05] hover:text-ink focus-visible:outline-none"
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-black/[0.05] hover:text-ink focus-visible:outline-none"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 md:px-8">
              {/* Quick Metrics KPI Bar */}
              <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-line bg-white p-3.5 shadow-2xs">
                <div className="text-center border-r border-line/60 pr-2">
                  <span className="text-[11px] uppercase tracking-wider text-ink-3">Admit Rate</span>
                  <p className="mt-1 font-mono text-[16px] font-bold text-ink">{acceptanceDisplay}</p>
                </div>
                <div className="text-center border-r border-line/60 px-2">
                  <span className="text-[11px] uppercase tracking-wider text-ink-3">Tuition / yr</span>
                  <p className="mt-1 font-mono text-[16px] font-bold text-ink">{formatUSD(u.tuition ?? 0)}</p>
                </div>
                <div className="text-center pl-2">
                  <span className="text-[11px] uppercase tracking-wider text-ink-3">Living / yr</span>
                  <p className="mt-1 font-mono text-[16px] font-bold text-ink">{formatUSD(u.living ?? 0)}</p>
                </div>
              </div>

              {/* Fit Analysis & SHAP Factors */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-[17px] font-semibold text-ink">
                      Why this is a {tierLabel[item.fit.tier]} for you
                    </h3>
                    <p className="text-[13px] text-ink-3 mt-0.5">
                      Baseline fit begins at 50. Each profile metric awards or deducts points based on committee selectivity.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-white p-5 shadow-2xs">
                  <ShapBars
                    items={(item.fit?.reasons || []).map((r, idx) => ({
                      id: r.key || `reason-${idx}`,
                      label: r.label || 'Admissions Factor',
                      contribution: typeof r.impact === 'number' && !isNaN(r.impact) ? r.impact : 0,
                      explanation: r.text || ''
                    }))}
                    showExplanations
                    size="sm"
                    maxAbs={20}
                  />
                </div>
              </section>

              {/* Side-by-Side Admitted Medians vs Your Profile */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    Your Profile vs. Admitted Medians
                  </h3>
                  <span className="text-[12px] text-ink-3">Historical benchmark</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* GPA Box */}
                  <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
                    <span className="text-[11px] font-medium text-ink-3 uppercase tracking-wider">GPA (out of 10)</span>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="font-mono text-[16px] font-bold text-ink">
                        {profile.gpa > 0 ? profile.gpa.toFixed(1) : '--'}
                      </span>
                      <span className="text-[12px] text-ink-3 font-mono">Median: {avgGpaDisplay}</span>
                    </div>
                    {profile.gpa > 0 && (
                      <div className="mt-2 text-[11px]">
                        {gpaDelta >= 0 ? (
                          <span className="font-semibold text-emerald-700">+{gpaDelta.toFixed(1)} above median</span>
                        ) : (
                          <span className="font-semibold text-amber-700">{gpaDelta.toFixed(1)} below median</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* GRE Box */}
                  <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
                    <span className="text-[11px] font-medium text-ink-3 uppercase tracking-wider">GRE Score</span>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="font-mono text-[16px] font-bold text-ink">
                        {profile.gre > 0 ? profile.gre : '--'}
                      </span>
                      <span className="text-[12px] text-ink-3 font-mono">Median: {u.avgGre || 320}</span>
                    </div>
                    {profile.gre > 0 && (
                      <div className="mt-2 text-[11px]">
                        {greDelta >= 0 ? (
                          <span className="font-semibold text-emerald-700">+{greDelta} above median</span>
                        ) : (
                          <span className="font-semibold text-amber-700">{greDelta} gap</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TOEFL / IELTS Box */}
                  <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
                    <span className="text-[11px] font-medium text-ink-3 uppercase tracking-wider">
                      {profile.englishTestType === 'ielts' ? 'IELTS (TOEFL Eq.)' : 'TOEFL iBT'}
                    </span>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="font-mono text-[16px] font-bold text-ink">
                        {profile.englishTestType === 'ielts' && profile.ieltsScore
                          ? `${profile.ieltsScore} (${profile.toefl})`
                          : profile.toefl > 0
                          ? profile.toefl
                          : '--'}
                      </span>
                      <span className="text-[12px] text-ink-3 font-mono">Min: {u.avgToefl || 100}</span>
                    </div>
                    {profile.toefl > 0 && (
                      <div className="mt-2 text-[11px]">
                        {toeflDelta >= 0 ? (
                          <span className="font-semibold text-emerald-700">Satisfies requirement</span>
                        ) : (
                          <span className="font-semibold text-rose-700">{toeflDelta} below minimum</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Similar Profiles & Past Outcomes */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    Similar Profiles, Past Outcomes
                  </h3>
                  <span className="text-[12px] text-ink-3">±0.5 GPA · ±8 GRE</span>
                </div>

                {similar.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-line-strong p-6 text-center text-[13px] text-ink-3">
                    Aggregating historical admit records for this program.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-line bg-white shadow-2xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-line bg-stone-50/70 text-[11.5px] uppercase tracking-wider text-ink-3">
                          <th className="px-4 py-2.5 font-medium">Applicant</th>
                          <th className="px-3 py-2.5 text-right font-medium">GPA</th>
                          <th className="px-3 py-2.5 text-right font-medium">GRE</th>
                          <th className="px-3 py-2.5 text-right font-medium">Papers</th>
                          <th className="px-3 py-2.5 text-right font-medium">Work</th>
                          <th className="px-4 py-2.5 text-right font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[13px] tabular-nums">
                        {/* Current User Row */}
                        <tr className="border-b border-line bg-indigo-50/40">
                          <td className="px-4 py-2.5 font-sans text-[13px] font-semibold text-indigo-700">You</td>
                          <td className="px-3 py-2.5 text-right font-semibold">
                            {profile.gpa > 0 ? profile.gpa.toFixed(1) : '--'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold">
                            {profile.gre > 0 ? profile.gre : '--'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold">{profile.publications}</td>
                          <td className="px-3 py-2.5 text-right font-semibold">{profile.workMonths}m</td>
                          <td className="px-4 py-2.5 text-right font-sans text-[12px] text-indigo-700 font-semibold">
                            In Review
                          </td>
                        </tr>

                        {similar.map((o) => (
                          <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-stone-50/50">
                            <td className="px-4 py-2.5 font-sans text-[13px] text-ink-2">{o.cycle}</td>
                            <td className="px-3 py-2.5 text-right">{typeof o.gpa === 'number' && !isNaN(o.gpa) ? o.gpa.toFixed(1) : (o.gpa || '--')}</td>
                            <td className="px-3 py-2.5 text-right">{o.gre}</td>
                            <td className="px-3 py-2.5 text-right">{o.publications}</td>
                            <td className="px-3 py-2.5 text-right">{o.workMonths}m</td>
                            <td
                              className={`px-4 py-2.5 text-right font-sans text-[12px] font-bold ${
                                o.result === 'admit' ? 'text-emerald-700' : 'text-stone-400'
                              }`}
                            >
                              {o.result === 'admit' ? 'Admitted' : 'Rejected'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* What If Simulation CTA Banner */}
              <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50/70 via-indigo-50/50 to-purple-50/60 p-5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-2xs">
                    <SparklesIcon className="h-4 w-4" />
                  </span>
                  <h4 className="font-display text-[15px] font-bold text-violet-950">
                    Want to move {u.name} to a safer tier?
                  </h4>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-violet-900/80">
                  Simulate GRE retakes, research paper publications, or SOP score lifts in the What If ?? simulator to see exactly how your tier shifts.
                </p>
                <div className="mt-3.5">
                  <Link
                    to="/app/roadmap"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-violet-700 hover:text-violet-900 transition-colors"
                  >
                    Open What If ?? Simulator <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between border-t border-line bg-white px-6 py-4 md:px-8">
              <div className="flex items-center gap-2 text-[13px] text-ink-3">
                <CalendarIcon className="h-4 w-4 text-ink-3" />
                <span>Deadline: {formatDate(u.deadline, 'MMM d, yyyy')}</span>
              </div>

              <Button
                onClick={() => addApplication(u.id, u, item.fit.tier, item.fit.fit, item.fit.reasons)}
                disabled={tracked}
                variant={tracked ? 'secondary' : 'primary'}
                className="gap-1.5"
              >
                {tracked ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <PlusIcon className="h-4 w-4" />}
                {tracked ? 'In Applications Tracker' : 'Track Application'}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
