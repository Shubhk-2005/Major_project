import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react';
import { ShapBars } from '../ui/ShapBars';
import { TierBadge } from '../ui/TierBadge';
import { Button } from '../ui/Button';
import { RankedUniversity } from '../../types/university';
import { outcomes } from '../../data/outcomes';
import { useProfile } from '../../contexts/ProfileContext';
import { useApplications } from '../../contexts/ApplicationsContext';
import { formatDate, formatUSD } from '../../utils/format';
import { tierLabel } from '../../utils/tiers';

interface UniversityDrawerProps {
  item: RankedUniversity | null;
  onClose: () => void;
}

export function UniversityDrawer({ item, onClose }: UniversityDrawerProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { profile } = useProfile();
  const { addApplication, isTracked } = useApplications();

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item &&
      <>
          <motion.div
          className="fixed inset-0 z-40 bg-ink/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-line bg-canvas"
          initial={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}>
          
            <DrawerBody item={item} closeRef={closeRef} onClose={onClose} tracked={isTracked(item.university.id)} onTrack={() => addApplication(item.university.id)} profileSummary={{ gpa: profile.gpa, gre: profile.gre, publications: profile.publications, workMonths: profile.workMonths }} />
          </motion.aside>
        </>
      }
    </AnimatePresence>);

}

interface DrawerBodyProps {
  item: RankedUniversity;
  closeRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  tracked: boolean;
  onTrack: () => void;
  profileSummary: {gpa: number;gre: number;publications: number;workMonths: number;};
}

function DrawerBody({ item, closeRef, onClose, tracked, onTrack, profileSummary }: DrawerBodyProps) {
  const u = item.university;
  const similar = outcomes.filter((o) => o.universityId === u.id);
  const stats = [
  ['QS CS rank', `#${u.rank}`],
  ['Acceptance', `${u.acceptance}%`],
  ['Avg GRE', `${u.avgGre}`],
  ['Avg GPA', `${u.avgGpa.toFixed(1)}`],
  ['Min TOEFL', `${u.avgToefl}`],
  ['Tuition / yr', formatUSD(u.tuition)],
  ['Living / yr', formatUSD(u.living)],
  ['Deadline', formatDate(u.deadline, 'MMM d, yyyy')]];


  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
        <div className="min-w-0">
          <h2 id="drawer-title" className="font-display text-[24px] font-semibold leading-tight tracking-[-0.03em]">
            {u.name}
          </h2>
          <p className="mt-1 text-[14px] text-ink-2">
            {u.program} · {u.city}, {u.country}
          </p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-ink-3 transition-colors duration-150 hover:bg-black/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8 md:px-8">
        <section>
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-[17px] font-medium tracking-[-0.02em]">Why this is a {tierLabel[item.fit.tier]}</h3>
            <TierBadge tier={item.fit.tier} fit={item.fit.fit} />
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3">Fit starts at 50 and each factor adds or subtracts points. Totals are clamped between 3 and 97.</p>
          <div className="mt-4 rounded-md border border-line bg-white px-5 py-1">
            <ShapBars items={item.fit.reasons.map((r) => ({ id: r.key, label: r.label, contribution: r.impact, explanation: r.text }))} showExplanations size="sm" maxAbs={20} />
          </div>
        </section>

        <section>
          <h3 className="font-display text-[17px] font-medium tracking-[-0.02em]">Admission statistics</h3>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {stats.map(([k, v]) =>
            <div key={k}>
                <dt className="text-[12px] text-ink-3">{k}</dt>
                <dd className="mt-0.5 font-mono text-[16px] tabular-nums text-ink">{v}</dd>
              </div>
            )}
          </dl>
        </section>

        <section>
          <h3 className="font-display text-[17px] font-medium tracking-[-0.02em]">Similar profiles, past outcomes</h3>
          <p className="mt-2 text-[13px] text-ink-3">Anonymized applicants within ±0.5 GPA and ±8 GRE of you.</p>
          {similar.length === 0 ?
          <p className="mt-4 rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-[14px] text-ink-3">Not enough similar profiles for this program yet.</p> :

          <div className="mt-4 overflow-hidden rounded-md border border-line bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line text-[12px] text-ink-3">
                    <th className="px-4 py-2.5 font-normal">Applicant</th>
                    <th className="px-4 py-2.5 text-right font-normal">GPA</th>
                    <th className="px-4 py-2.5 text-right font-normal">GRE</th>
                    <th className="px-4 py-2.5 text-right font-normal">Papers</th>
                    <th className="px-4 py-2.5 text-right font-normal">Work</th>
                    <th className="px-4 py-2.5 text-right font-normal">Result</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px] tabular-nums">
                  <tr className="border-b border-line bg-accent-soft">
                    <td className="px-4 py-2.5 font-sans text-[13px] font-medium text-accent">You</td>
                    <td className="px-4 py-2.5 text-right">{profileSummary.gpa.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right">{profileSummary.gre}</td>
                    <td className="px-4 py-2.5 text-right">{profileSummary.publications}</td>
                    <td className="px-4 py-2.5 text-right">{profileSummary.workMonths}m</td>
                    <td className="px-4 py-2.5 text-right font-sans text-ink-3">—</td>
                  </tr>
                  {similar.map((o) =>
                <tr key={o.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-sans text-[13px] text-ink-2">{o.cycle}</td>
                      <td className="px-4 py-2.5 text-right">{o.gpa.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-right">{o.gre}</td>
                      <td className="px-4 py-2.5 text-right">{o.publications}</td>
                      <td className="px-4 py-2.5 text-right">{o.workMonths}m</td>
                      <td className={`px-4 py-2.5 text-right font-sans text-[13px] font-medium ${o.result === 'admit' ? 'text-ink' : 'text-ink-3'}`}>{o.result === 'admit' ? 'Admit' : 'Reject'}</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }
        </section>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 md:px-8">
        <p className="text-[13px] text-ink-3">Deadline {formatDate(u.deadline, 'MMM d')}</p>
        <Button onClick={onTrack} disabled={tracked} variant={tracked ? 'secondary' : 'primary'}>
          {tracked ? <CheckIcon className="h-4 w-4" aria-hidden /> : <PlusIcon className="h-4 w-4" aria-hidden />}
          {tracked ? 'In tracker' : 'Add to tracker'}
        </Button>
      </div>
    </>);

}