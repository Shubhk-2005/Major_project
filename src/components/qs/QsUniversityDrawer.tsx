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
    const text = `QS Rank 2026: #${item.rank} - ${item.name} (${item.country})\nPG CS Annual Tuition: ${item.tuitionRaw} USD\nNotes: ${item.notes || 'None'}`;
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[540px] flex-col border-l border-line bg-canvas shadow-2xl"
            initial={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-[16px] font-bold text-accent">
                  #{item.rank}
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    <TrophyIcon className="h-3 w-3" /> QS World Rank 2026
                  </span>
                  <h2 id="qs-drawer-title" className="mt-1 font-display text-[18px] font-semibold leading-snug text-ink">
                    {item.name}
                  </h2>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded p-1.5 text-ink-3 transition-colors duration-150 hover:bg-black/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Country & Region Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-[13px] font-medium text-ink">
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

              {/* Tuition Box */}
              <div className="mt-6 rounded-xl border border-line bg-white p-5 shadow-sm">
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
              <div className="mt-6 rounded-xl border border-line bg-white p-5 shadow-sm">
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
              <div className="mt-6 rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <InfoIcon className="h-4 w-4 text-accent" />
                  QS Top 150 Benchmark
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                  In the 2026 QS Top 150, the median annual CS graduate tuition is approximately{' '}
                  <strong className="text-ink">$29,400 USD</strong>.
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

              {/* Next Steps CTA */}
              <div className="mt-6 rounded-xl border border-accent/20 bg-accent-soft p-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-accent">
                  <SparklesIcon className="h-4 w-4" />
                  Evaluate Your Chances
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                  Antigravity simulates your acceptance odds for top universities based on your GPA, GRE, publications, and work experience.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button to="/app/explorer" size="sm" className="w-full">
                    View in Explorer <ArrowRightIcon className="h-3.5 w-3.5" />
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
                    <CheckIcon className="h-4 w-4 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4 text-ink-3" /> Copy Details
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
