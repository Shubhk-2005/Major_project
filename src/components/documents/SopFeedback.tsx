import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { ShapBars } from '../ui/ShapBars';
import { Button } from '../ui/Button';
import { useProfile } from '../../contexts/ProfileContext';
import { useCountUp } from '../../hooks/useCountUp';
import { sopRubric, sopSegments } from '../../data/sop';
import { SopDecision } from '../../types/document';
import { formatSigned } from '../../utils/format';

function qualityFrom(decisions: Record<string, SopDecision>) {
  const rubric = sopRubric.map((r) => {
    const gained = sopSegments.
    filter((s) => s.suggestion && s.suggestion.type === r.type && decisions[s.id] === 'accepted').
    reduce((a, s) => a + (s.suggestion?.impact ?? 0), 0);
    return { ...r, contribution: Math.round((r.base + gained) * 10) / 10 };
  });
  const quality = Math.round(70 + rubric.reduce((a, r) => a + r.contribution, 0));
  return { rubric, quality };
}

export function SopFeedback() {
  const { sopDecisions, setSopDecisions, updateProfile, factors } = useProfile();
  const suggestions = sopSegments.filter((s) => s.suggestion);
  const firstPending = suggestions.find((s) => !sopDecisions[s.id])?.id ?? null;
  const [activeId, setActiveId] = useState<string | null>(firstPending);

  const { rubric, quality } = useMemo(() => qualityFrom(sopDecisions), [sopDecisions]);
  const display = useCountUp(quality, 0.5);
  const sopFactor = factors.find((f) => f.key === 'sop');
  const resolved = suggestions.filter((s) => sopDecisions[s.id]).length;
  const active = sopSegments.find((s) => s.id === activeId && s.suggestion);

  const decide = (id: string, d: SopDecision | null) => {
    const next = { ...sopDecisions };
    if (d) next[id] = d;else
    delete next[id];
    setSopDecisions(next);
    updateProfile({ sopQuality: qualityFrom(next).quality });
    if (d) setActiveId(suggestions.find((s) => s.id !== id && !next[s.id])?.id ?? null);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <article className="lg:col-span-7">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="text-[14px] font-medium">SOP_general_v3.docx</h2>
          <p className="font-mono text-[12px] text-ink-3">
            {resolved}/{suggestions.length} resolved
          </p>
        </div>
        <div className="mt-6 whitespace-pre-wrap rounded-lg border border-line bg-white p-6 font-sans text-[16px] leading-[1.85] text-ink md:p-10">
          {sopSegments.map((seg) => {
            if (!seg.suggestion) return <span key={seg.id}>{seg.text}</span>;
            const decision = sopDecisions[seg.id];
            if (decision === 'accepted') return <span key={seg.id} className="bg-accent-soft/60">{seg.suggestion.replacement}</span>;
            if (decision === 'dismissed') return <span key={seg.id}>{seg.text}</span>;
            const isActive = activeId === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setActiveId(seg.id)}
                aria-pressed={isActive}
                aria-label={`${seg.suggestion.type} suggestion: ${seg.text}`}
                className={`inline rounded-sm text-left underline decoration-accent decoration-2 underline-offset-[5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isActive ? 'bg-accent-soft' : 'hover:bg-accent-soft/60'}`}>
                
                {seg.text}
              </button>);

          })}
        </div>
      </article>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] text-ink-3">SOP quality</p>
              <p className="font-mono text-[56px] font-medium leading-none tracking-[-0.04em] tabular-nums">{display}</p>
            </div>
            {sopFactor &&
            <p className="max-w-[200px] text-right text-[13px] leading-snug text-ink-2">
                Contributes <span className={`font-mono tabular-nums ${sopFactor.contribution >= 0 ? 'text-accent' : 'text-ink'}`}>{formatSigned(sopFactor.contribution)}</span> to your competitiveness score
              </p>
            }
          </div>
          <div className="mt-4 rounded-md border border-line bg-white px-5 py-1">
            <ShapBars size="sm" maxAbs={5} items={rubric.map((r) => ({ id: r.type, label: r.type, contribution: r.contribution }))} />
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {active && active.suggestion ?
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="rounded-md border border-ink bg-white p-5">
                
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-medium text-accent">{active.suggestion.type}</p>
                    <p className="font-mono text-[12px] tabular-nums text-accent">+{active.suggestion.impact} pts</p>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{active.suggestion.note}</p>
                  <p className="mt-4 text-[12px] text-ink-3">Suggested rewrite</p>
                  <p className="mt-1 border-l-2 border-accent pl-3 text-[14px] leading-relaxed text-ink">{active.suggestion.replacement}</p>
                  <div className="mt-5 flex gap-2">
                    <Button size="sm" onClick={() => decide(active.id, 'accepted')}>
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(active.id, 'dismissed')}>
                      <XIcon className="h-3.5 w-3.5" aria-hidden />
                      Dismiss
                    </Button>
                  </div>
                </motion.div> :

              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="rounded-md border border-dashed border-line-strong p-5">
                  <p className="text-[14px] font-medium">{resolved === suggestions.length ? 'All suggestions resolved' : 'Select an underlined passage'}</p>
                  <p className="mt-1 text-[13px] text-ink-3">
                    {resolved === suggestions.length ? 'Your updated SOP quality is reflected in your dashboard score.' : 'Each one shows the issue, a rewrite, and its effect on your SOP score.'}
                  </p>
                  {resolved > 0 &&
                <button
                  type="button"
                  onClick={() => {
                    setSopDecisions({});
                    updateProfile({ sopQuality: qualityFrom({}).quality });
                    setActiveId(suggestions[0]?.id ?? null);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink">
                  
                      <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
                      Reset to original draft
                    </button>
                }
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </div>);

}