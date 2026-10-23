import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';

const links = ['Methodology', 'Privacy', 'Terms', 'Contact'];

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        {/* Prediction Accuracy Disclaimer */}
        <div className="mb-8 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 md:p-5 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-[12px] font-bold uppercase tracking-wider text-amber-900">
                Admissions Prediction Accuracy Disclaimer
              </p>
              <p className="text-[13px] leading-relaxed text-amber-950/80">
                <strong>Important Notice:</strong> All admission predictions, competitiveness scores, and university recommendations on this website are AI-driven statistical estimates based on historical admissions data and <strong className="underline decoration-amber-400">are not 100% accurate</strong>. Final admission decisions are made holistically by respective university admissions committees.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-t border-line/60 pt-6">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="text-[13px] text-ink-3">© 2026 MsAdmit. All rights reserved.</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6">
            {links.map((l) => (
              <a
                key={l}
                href="#"
                className="text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}