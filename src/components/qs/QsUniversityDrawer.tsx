import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  XIcon,
  TrophyIcon,
  GlobeIcon,
  DollarSignIcon,
  FileTextIcon,
  CheckIcon,
  CopyIcon,
  ArrowRightIcon,
  SparklesIcon,
  InfoIcon,
  BriefcaseIcon,
  BookOpenIcon,
  GraduationCapIcon,
  MicroscopeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  AwardIcon,
  BarChart3Icon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { QsUniversity } from '../../data/qsUniversities';

interface QsUniversityDrawerProps {
  item: QsUniversity | null;
  onClose: () => void;
}

export function QsUniversityDrawer({ item, onClose }: QsUniversityDrawerProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  const handleCopy = () => {
    if (!item) return;
    const rankChange =
      item.rank2025 === null
        ? 'New Entry'
        : item.rank < item.rank2025
        ? `Climbed +${item.rank2025 - item.rank}`
        : item.rank > item.rank2025
        ? `Down -${item.rank - item.rank2025}`
        : 'Unchanged';

    const text = [
      `QS World University Rankings 2026: #${item.rank} - ${item.name} (${item.country})`,
      `2025 Rank: ${item.rank2025 ? `#${item.rank2025}` : 'Unranked'} (${rankChange})`,
      `Overall Score: ${item.overallScore ? `${item.overallScore}/100` : 'N/A'}`,
      `• Employer Reputation: ${item.employerScore ?? 'N/A'} (Rank #${item.employerRank ?? 'N/A'})`,
      `• Citations per Faculty: ${item.citationsScore ?? 'N/A'} (Rank #${item.citationsRank ?? 'N/A'})`,
      `• Academic Reputation: ${item.academicScore ?? 'N/A'} (Rank #${item.academicRank ?? 'N/A'})`,
      `• H-Index Citations: ${item.hIndexScore ?? 'N/A'} (Rank #${item.hIndexRank ?? 'N/A'})`,
      `• International Research Network (IRN): ${item.irnScore ?? 'N/A'} (Rank #${item.irnRank ?? 'N/A'})`,
      `Annual PG CS Tuition: ${item.tuitionRaw} USD`,
      item.notes ? `Tuition Notes: ${item.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTuitionTag = (uni: QsUniversity) => {
    if (uni.tuitionUSD === 0 || uni.tuitionRaw === '0') {
      return { label: 'Tuition-Free / Full Scholarship', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (uni.tuitionUSD !== null && uni.tuitionUSD <= 5000) {
      return { label: 'Ultra-Low Tuition (< $5,000/yr)', color: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
    if (uni.tuitionUSD !== null && uni.tuitionUSD <= 25000) {
      return { label: 'Moderate Tuition ($5K-$25K/yr)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    if (uni.tuitionUSD !== null && uni.tuitionUSD > 50000) {
      return { label: 'High Investment (> $50,000/yr)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { label: 'Standard Master’s Fee', color: 'bg-stone-100 text-stone-700 border-stone-200' };
  };

  const renderRankChange = (uni: QsUniversity) => {
    if (uni.rank2025 === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
          <SparklesIcon className="h-3 w-3" /> New 2026 Entry
        </span>
      );
    }
    const diff = uni.rank2025 - uni.rank;
    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          <TrendingUpIcon className="h-3 w-3" /> +{diff} spots (was #{uni.rank2025})
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
          <TrendingDownIcon className="h-3 w-3" /> {diff} spots (was #{uni.rank2025})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-ink-3 border border-stone-200">
        <MinusIcon className="h-3 w-3" /> Same as 2025 (#{uni.rank2025})
      </span>
    );
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="qs-drawer-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[580px] flex-col border-l border-line bg-canvas shadow-2xl"
            initial={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line bg-white px-6 py-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono text-[17px] font-bold text-accent shadow-sm">
                  #{item.rank}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                      <TrophyIcon className="h-3 w-3" /> QS Rank 2026
                    </span>
                    {renderRankChange(item)}
                  </div>
                  <h2 id="qs-drawer-title" className="mt-1.5 font-display text-[19px] font-bold leading-snug text-ink">
                    {item.name}
                  </h2>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-ink-3 transition-colors duration-150 hover:bg-black/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Location & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-[13px] font-medium text-ink shadow-2xs">
                  <GlobeIcon className="h-3.5 w-3.5 text-ink-3" />
                  {item.country}
                </span>
                <span className="rounded-md border border-line bg-canvas px-2.5 py-1 text-[13px] text-ink-2">
                  {item.region}
                </span>
                <span className={`rounded-md border px-2.5 py-1 text-[12px] font-medium ${getTuitionTag(item).color}`}>
                  {getTuitionTag(item).label}
                </span>
              </div>

              {/* Overall Score Hero Card */}
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-white via-accent-soft/30 to-amber-50/20 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-accent">
                      <AwardIcon className="h-4 w-4" /> QS Overall Performance Score
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-[38px] font-black text-ink">
                        {item.overallScore ? item.overallScore.toFixed(1) : '—'}
                      </span>
                      <span className="font-mono text-[14px] text-ink-3">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-lg bg-white px-3 py-1 font-mono text-[13px] font-semibold text-ink shadow-2xs border border-line">
                      Top {item.rank <= 10 ? '1%' : item.rank <= 50 ? '3%' : '10%'} Global
                    </span>
                    <div className="mt-1 text-[11.5px] text-ink-3">
                      {item.rank2025 ? `Ranked #${item.rank2025} in 2025` : 'New in 2026'}
                    </div>
                  </div>
                </div>

                {/* Micro progress bar for overall score */}
                {item.overallScore && (
                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, item.overallScore))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QS Reputation & Research Metrics Section */}
              <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3Icon className="h-4 w-4 text-accent" />
                    <h3 className="text-[14px] font-bold text-ink">QS Performance Indicators Breakdown</h3>
                  </div>
                  <span className="text-[11.5px] text-ink-3">Official QS Metrics</span>
                </div>

                <div className="mt-4 space-y-4">
                  {/* Citations per Faculty */}
                  <div className="rounded-lg border border-line/70 bg-[#FAFAF8] p-3.5 transition-colors hover:border-line">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                          <BookOpenIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-ink">Citations per Faculty</span>
                          <p className="text-[11px] text-ink-3">Research impact and citation density</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[15px] font-bold text-ink">
                          {item.citationsScore !== null ? item.citationsScore.toFixed(1) : '—'}
                          <span className="text-[11px] font-normal text-ink-3"> /100</span>
                        </div>
                        {item.citationsRank !== null && (
                          <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-blue-800 border border-blue-200/80">
                            Global #{item.citationsRank}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.citationsScore !== null && (
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.min(100, Math.max(0, item.citationsScore))}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Employer Reputation */}
                  <div className="rounded-lg border border-line/70 bg-[#FAFAF8] p-3.5 transition-colors hover:border-line">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                          <BriefcaseIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-ink">Employer Reputation</span>
                          <p className="text-[11px] text-ink-3">Recruiter esteem and hiring readiness</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[15px] font-bold text-ink">
                          {item.employerScore !== null ? item.employerScore.toFixed(1) : '—'}
                          <span className="text-[11px] font-normal text-ink-3"> /100</span>
                        </div>
                        {item.employerRank !== null && (
                          <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800 border border-emerald-200/80">
                            Global #{item.employerRank}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.employerScore !== null && (
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-600" style={{ width: `${Math.min(100, Math.max(0, item.employerScore))}%` }} />
                    )}
                  </div>

                  {/* Academic Reputation */}
                  <div className="rounded-lg border border-line/70 bg-[#FAFAF8] p-3.5 transition-colors hover:border-line">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                          <GraduationCapIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-ink">Academic Reputation</span>
                          <p className="text-[11px] text-ink-3">Peer survey score across 100K+ global faculty</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[15px] font-bold text-ink">
                          {item.academicScore !== null ? item.academicScore.toFixed(1) : '—'}
                          <span className="text-[11px] font-normal text-ink-3"> /100</span>
                        </div>
                        {item.academicRank !== null && (
                          <span className="inline-block rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-purple-800 border border-purple-200/80">
                            Global #{item.academicRank}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.academicScore !== null && (
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-purple-600" style={{ width: `${Math.min(100, Math.max(0, item.academicScore))}%` }} />
                    )}
                  </div>

                  {/* H-Index & IRN 2-Column Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* H-Index Citations */}
                    <div className="rounded-lg border border-line/70 bg-[#FAFAF8] p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MicroscopeIcon className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-[12.5px] font-bold text-ink">H-Index Citations</span>
                        </div>
                        {item.hIndexRank !== null && (
                          <span className="rounded bg-amber-50 px-1 py-0.5 font-mono text-[10.5px] font-semibold text-amber-800 border border-amber-200/80">
                            #{item.hIndexRank}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="font-mono text-[16px] font-bold text-ink">
                          {item.hIndexScore !== null ? item.hIndexScore.toFixed(1) : '—'}
                        </span>
                        <span className="text-[10.5px] text-ink-3">Productivity & impact</span>
                      </div>
                    </div>

                    {/* International Research Network */}
                    <div className="rounded-lg border border-line/70 bg-[#FAFAF8] p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <GlobeIcon className="h-3.5 w-3.5 text-teal-600" />
                          <span className="text-[12.5px] font-bold text-ink">International Research</span>
                        </div>
                        {item.irnRank !== null && (
                          <span className="rounded bg-teal-50 px-1 py-0.5 font-mono text-[10.5px] font-semibold text-teal-800 border border-teal-200/80">
                            #{item.irnRank}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="font-mono text-[16px] font-bold text-ink">
                          {item.irnScore !== null ? item.irnScore.toFixed(1) : '—'}
                        </span>
                        <span className="text-[10.5px] text-ink-3">Global co-authorship</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tuition Box */}
              <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
                    <DollarSignIcon className="h-4 w-4 text-accent" />
                    PG CS Annual Tuition (Approx)
                  </span>
                  <span className="font-mono text-[12px] text-ink-3">USD / Year</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="font-display text-[32px] font-bold tracking-tight text-ink">
                    {item.tuitionRaw.startsWith('$') ? item.tuitionRaw : `$${item.tuitionRaw}`}
                  </p>
                  {item.tuitionUSD !== null && item.tuitionUSD > 0 && (
                    <span className="text-[13px] text-ink-3">approx.</span>
                  )}
                </div>

                {item.tuitionUSD === 0 && (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-[13px] text-emerald-800">
                    🎉 <strong>100% Tuition-Free / Fully Funded:</strong> This program has zero statutory tuition or offers full scholarship coverage.
                  </div>
                )}
              </div>

              {/* Verified Notes */}
              <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <FileTextIcon className="h-4 w-4 text-ink-2" />
                  Tuition Notes & Program Specifics
                </div>
                <div className="mt-3 rounded-lg bg-canvas p-3.5 text-[13.5px] leading-relaxed text-ink-2">
                  {item.notes ? (
                    <p>{item.notes}</p>
                  ) : (
                    <p className="italic text-ink-3">
                      Standard international graduate tuition applies. Please verify program-specific fees on the official university portal.
                    </p>
                  )}
                </div>
              </div>

              {/* Global Benchmark Comparison */}
              <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <InfoIcon className="h-4 w-4 text-accent" />
                  QS Top 150 Benchmark Comparison
                </div>
                <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-2">
                  <p>
                    • <strong>Employer Reputation:</strong>{' '}
                    {item.employerScore !== null && item.employerScore >= 73.0 ? (
                      <span className="text-emerald-700 font-medium">
                        Above average (+{(item.employerScore - 73.0).toFixed(1)} pts above the Top-150 median of 73.0)
                      </span>
                    ) : item.employerScore !== null ? (
                      <span className="text-ink-2">
                        {(73.0 - item.employerScore).toFixed(1)} pts below the Top-150 median of 73.0
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    • <strong>Citations per Faculty:</strong>{' '}
                    {item.citationsScore !== null && item.citationsScore >= 85.4 ? (
                      <span className="text-blue-700 font-medium">
                        Above average (+{(item.citationsScore - 85.4).toFixed(1)} pts above Top-150 average of 85.4)
                      </span>
                    ) : item.citationsScore !== null ? (
                      <span className="text-ink-2">
                        {(85.4 - item.citationsScore).toFixed(1)} pts below Top-150 average of 85.4
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    • <strong>Annual Tuition:</strong> Median CS tuition is <strong>$29,400 USD</strong>.
                    {item.tuitionUSD !== null && (
                      <span>
                        {' '}
                        {item.tuitionUSD < 29400
                          ? `This institution is roughly $${(29400 - item.tuitionUSD).toLocaleString()} lower than the global median.`
                          : `This institution is roughly $${(item.tuitionUSD - 29400).toLocaleString()} above the global median.`}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Next Steps CTA */}
              <div className="rounded-xl border border-accent/20 bg-accent-soft p-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-accent">
                  <SparklesIcon className="h-4 w-4" />
                  Evaluate Your Chances
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                  Antigravity simulates your admission readiness score for {item.name} based on your GPA, GRE, publications, and professional background.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button to="/app/explorer" size="sm" className="w-full">
                    Simulate Profile Fit <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line bg-white px-6 py-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-emerald-600" /> Copied Full Profile!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4 text-ink-3" /> Copy Indicators & Details
                  </>
                )}
              </button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
