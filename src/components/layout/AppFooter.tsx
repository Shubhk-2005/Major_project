import React from 'react';
import { AlertCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-white/60 py-8 text-ink">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Core Disclaimer Box */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 md:p-5 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-[12px] font-bold uppercase tracking-wider text-amber-900">
                Admissions Prediction Accuracy Disclaimer
              </p>
              <p className="text-[13px] leading-relaxed text-amber-950/80">
                <strong>Important Notice:</strong> All admission predictions, competitiveness scores, and university fit tierings provided on this website are AI-generated statistical estimates based on historical admissions data and <strong className="underline decoration-amber-400">are not 100% accurate</strong>. University admissions decisions are determined holistically by institutional committees and vary year-over-year. Always verify official university requirements and deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta & Navigation */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-6 text-[12px] text-ink-3 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo />
            <span>© 2026 MsAdmit. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5 text-ink-2">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-accent" /> ML Evaluated
            </span>
            <a href="#" className="transition-colors hover:text-ink">
              Methodology
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Terms of Use
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
