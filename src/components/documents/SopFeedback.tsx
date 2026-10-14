import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, RotateCcwIcon, XIcon, SparklesIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react';
import { ShapBars } from '../ui/ShapBars';
import { Button } from '../ui/Button';
import { useProfile } from '../../contexts/ProfileContext';
import { useCountUp } from '../../hooks/useCountUp';
import { sopRubric, sopSegments } from '../../data/sop';
import { SopDecision } from '../../types/document';
import { formatSigned } from '../../utils/format';
import { api } from '../../services/api';

function qualityFrom(decisions: Record<string, SopDecision>) {
  const rubric = sopRubric.map((r) => {
    const gained = sopSegments
      .filter((s) => s.suggestion && s.suggestion.type === r.type && decisions[s.id] === 'accepted')
      .reduce((a, s) => a + (s.suggestion?.impact ?? 0), 0);
    return { ...r, contribution: Math.round((r.base + gained) * 10) / 10 };
  });
  const quality = Math.round(70 + rubric.reduce((a, r) => a + r.contribution, 0));
  return { rubric, quality };
}

export function SopFeedback() {
  const { sopDecisions, setSopDecisions, updateProfile, factors, profile } = useProfile();
  const suggestions = sopSegments.filter((s) => s.suggestion);
  const firstPending = suggestions.find((s) => !sopDecisions[s.id])?.id ?? null;
  const [activeId, setActiveId] = useState<string | null>(firstPending);

  // Gemini 8-Criteria Evaluation State
  const [activeTab, setActiveTab] = useState<'line-review' | 'gemini-rubric'>('gemini-rubric');
  const [sopInput, setSopInput] = useState(
    sopSegments.map((s) => s.text).join(' ')
  );
  const [targetUni, setTargetUni] = useState('Carnegie Mellon University');
  const [targetProgram, setTargetProgram] = useState('Master of Science in Computer Science');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const { rubric, quality } = useMemo(() => qualityFrom(sopDecisions), [sopDecisions]);
  const currentSopQuality = evaluationResult?.weighted_score_100 ?? quality;
  const display = useCountUp(currentSopQuality, 0.5);
  const sopFactor = factors.find((f) => f.key === 'sop');
  const resolved = suggestions.filter((s) => sopDecisions[s.id]).length;
  const active = sopSegments.find((s) => s.id === activeId && s.suggestion);

  const decide = (id: string, d: SopDecision | null) => {
    const next = { ...sopDecisions };
    if (d) next[id] = d;
    else delete next[id];
    setSopDecisions(next);
    updateProfile({ sopQuality: qualityFrom(next).quality });
    if (d) setActiveId(suggestions.find((s) => s.id !== id && !next[s.id])?.id ?? null);
  };

  const handleRunGeminiEvaluation = async () => {
    if (!sopInput || sopInput.trim().length < 50) {
      setEvalError('Please provide at least 50 characters of SOP text.');
      return;
    }

    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await api.critiqueSop({
        sopText: sopInput,
        university: targetUni,
        program: targetProgram,
        programInformation: `Curriculum and admission criteria for ${targetUni} in ${targetProgram}.`
      });
      setEvaluationResult(res);
      // Synchronize with ML profile score
      if (res.weighted_score_100) {
        updateProfile({ sopQuality: Math.round(res.weighted_score_100) });
      }
    } catch (err: any) {
      console.error('Failed to run Gemini SOP critique:', err);
      setEvalError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <article className="lg:col-span-7">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('gemini-rubric')}
              className={`pb-1 text-[14px] font-medium transition-colors ${
                activeTab === 'gemini-rubric' ? 'border-b-2 border-ink text-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-accent" />
                Gemini 8-Criteria Rubric
              </span>
            </button>
            <button
              onClick={() => setActiveTab('line-review')}
              className={`pb-1 text-[14px] font-medium transition-colors ${
                activeTab === 'line-review' ? 'border-b-2 border-ink text-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              Draft Annotation View
            </button>
          </div>
          {activeTab === 'line-review' && (
            <p className="font-mono text-[12px] text-ink-3">
              {resolved}/{suggestions.length} resolved
            </p>
          )}
        </div>

        {activeTab === 'gemini-rubric' ? (
          <div className="mt-6 space-y-6">
            {/* Input & Parameters */}
            <div className="rounded-lg border border-line bg-white p-6 shadow-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-medium text-ink-2">Target University</label>
                  <input
                    type="text"
                    value={targetUni}
                    onChange={(e) => setTargetUni(e.target.value)}
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-[14px] text-ink focus:border-ink focus:outline-none"
                    placeholder="e.g. Carnegie Mellon University"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-ink-2">Target Program</label>
                  <input
                    type="text"
                    value={targetProgram}
                    onChange={(e) => setTargetProgram(e.target.value)}
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-[14px] text-ink focus:border-ink focus:outline-none"
                    placeholder="e.g. Master of Science in Computer Science"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[12px] font-medium text-ink-2">Statement of Purpose Draft</label>
                <textarea
                  rows={8}
                  value={sopInput}
                  onChange={(e) => setSopInput(e.target.value)}
                  className="mt-1 w-full rounded border border-line p-3 font-sans text-[14px] leading-relaxed text-ink focus:border-ink focus:outline-none"
                  placeholder="Paste your statement of purpose here..."
                />
              </div>

              {evalError && (
                <p className="mt-2 text-[13px] text-red-600">{evalError}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[12px] text-ink-3">
                  Graded on 8 academic criteria: preparation, quantification, meaning, goals, program fit, non-technical, narrative & compliance.
                </p>
                <Button onClick={handleRunGeminiEvaluation} disabled={evaluating}>
                  {evaluating ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Evaluating with AI...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      Evaluate SOP
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results Display */}
            {evaluationResult && (
              <div className="space-y-4">
                <div className="rounded-lg border border-line bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold text-ink">Evaluation Results</h3>
                      <p className="text-[13px] text-ink-3">
                        Evaluated for {evaluationResult.program} at {evaluationResult.university}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[28px] font-bold text-ink">
                        {evaluationResult.weighted_score_10} <span className="text-[16px] font-normal text-ink-3">/ 10</span>
                      </p>
                      <p className="text-[12px] text-accent font-medium">
                        Composite: {evaluationResult.weighted_score_100}%
                      </p>
                    </div>
                  </div>

                  {/* 8 Criteria Cards */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {Object.entries(evaluationResult.criteria || {}).map(([key, crit]: [string, any]) => {
                      const label = key
                        .split('_')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                      const scoreDisplay = crit.score !== null ? `${crit.score}/10` : 'N/A';

                      return (
                        <div key={key} className="rounded-md border border-line p-3.5 bg-canvas/40">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[13px] font-medium text-ink">{label}</span>
                            <span className="font-mono text-[12px] font-semibold text-ink-2">{scoreDisplay}</span>
                          </div>
                          {crit.strength && (
                            <p className="mt-2 text-[12px] text-ink-2">
                              <span className="font-medium text-emerald-700">Strength: </span>
                              {crit.strength}
                            </p>
                          )}
                          {crit.weakness && (
                            <p className="mt-1 text-[12px] text-ink-3">
                              <span className="font-medium text-amber-700">Growth: </span>
                              {crit.weakness}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Overall Strengths & Weaknesses */}
                  {evaluationResult.overall_strengths?.length > 0 && (
                    <div className="mt-6 border-t border-line pt-4">
                      <h4 className="text-[13px] font-medium text-ink mb-2">Key Strengths</h4>
                      <ul className="space-y-1 text-[13px] text-ink-2">
                        {evaluationResult.overall_strengths.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluationResult.improvement_suggestions?.length > 0 && (
                    <div className="mt-4 border-t border-line pt-4">
                      <h4 className="text-[13px] font-medium text-ink mb-2">Improvement Action Items</h4>
                      <ul className="space-y-1 text-[13px] text-ink-2">
                        {evaluationResult.improvement_suggestions.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircleIcon className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 whitespace-pre-wrap rounded-lg border border-line bg-white p-6 font-sans text-[16px] leading-[1.85] text-ink md:p-10">
            {sopSegments.map((seg) => {
              if (!seg.suggestion) return <span key={seg.id}>{seg.text}</span>;
              const decision = sopDecisions[seg.id];
              if (decision === 'accepted')
                return (
                  <span key={seg.id} className="bg-accent-soft/60">
                    {seg.suggestion.replacement}
                  </span>
                );
              if (decision === 'dismissed') return <span key={seg.id}>{seg.text}</span>;
              const isActive = activeId === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setActiveId(seg.id)}
                  aria-pressed={isActive}
                  aria-label={`${seg.suggestion.type} suggestion: ${seg.text}`}
                  className={`inline rounded-sm text-left underline decoration-accent decoration-2 underline-offset-[5px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                    isActive ? 'bg-accent-soft' : 'hover:bg-accent-soft/60'
                  }`}
                >
                  {seg.text}
                </button>
              );
            })}
          </div>
        )}
      </article>

      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] text-ink-3">SOP quality</p>
              <p className="font-mono text-[56px] font-medium leading-none tracking-[-0.04em] tabular-nums">
                {display}
              </p>
            </div>
            {sopFactor && (
              <p className="max-w-[200px] text-right text-[13px] leading-snug text-ink-2">
                Contributes{' '}
                <span
                  className={`font-mono tabular-nums ${
                    sopFactor.contribution >= 0 ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {formatSigned(sopFactor.contribution)}
                </span>{' '}
                to your competitiveness score
              </p>
            )}
          </div>

          <div className="mt-4 rounded-md border border-line bg-white px-5 py-1">
            <ShapBars
              size="sm"
              maxAbs={5}
              items={rubric.map((r) => ({ id: r.type, label: r.type, contribution: r.contribution }))}
            />
          </div>

          {activeTab === 'line-review' && (
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {active && active.suggestion ? (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-md border border-ink bg-white p-5"
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-[13px] font-medium text-accent">{active.suggestion.type}</p>
                      <p className="font-mono text-[12px] tabular-nums text-accent">
                        +{active.suggestion.impact} pts
                      </p>
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{active.suggestion.note}</p>
                    <p className="mt-4 text-[12px] text-ink-3">Suggested rewrite</p>
                    <p className="mt-1 border-l-2 border-accent pl-3 text-[14px] leading-relaxed text-ink">
                      {active.suggestion.replacement}
                    </p>
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-md border border-dashed border-line-strong p-5"
                  >
                    <p className="text-[14px] font-medium">
                      {resolved === suggestions.length ? 'All suggestions resolved' : 'Select an underlined passage'}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-3">
                      {resolved === suggestions.length
                        ? 'Your updated SOP quality is reflected in your dashboard score.'
                        : 'Each one shows the issue, a rewrite, and its effect on your SOP score.'}
                    </p>
                    {resolved > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSopDecisions({});
                          updateProfile({ sopQuality: qualityFrom({}).quality });
                          setActiveId(suggestions[0]?.id ?? null);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink"
                      >
                        <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
                        Reset to original draft
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}