import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  FileTextIcon,
  GraduationCapIcon,
  BarChart3Icon,
  BookOpenIcon,
  TargetIcon,
  Building2Icon,
  AwardIcon,
  PenToolIcon,
  ShieldCheckIcon,
  CopyIcon,
  CheckIcon,
  RotateCcwIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useProfile } from '../../contexts/ProfileContext';
import { useCountUp } from '../../hooks/useCountUp';
import { formatSigned } from '../../utils/format';
import { api } from '../../services/api';

interface CriterionMeta {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CRITERIA_CONFIG: Record<string, CriterionMeta> = {
  academic_preparation: {
    label: 'Academic Preparation',
    shortLabel: 'Preparation',
    icon: GraduationCapIcon,
    description: 'Coursework mastery, technical depth, and prerequisite readiness'
  },
  concrete_quantified_evidence: {
    label: 'Quantified Evidence & Metrics',
    shortLabel: 'Quantified Evidence',
    icon: BarChart3Icon,
    description: 'Measurable outcomes, benchmarks, numbers, and impact metrics'
  },
  experience_meaning: {
    label: 'Experience Meaning & Reflection',
    shortLabel: 'Reflection & Depth',
    icon: BookOpenIcon,
    description: 'Intellectual takeaways, problem-solving reflections, and engineering maturity'
  },
  specificity_of_goals: {
    label: 'Specificity of Goals',
    shortLabel: 'Goals & Vision',
    icon: TargetIcon,
    description: 'Clarity of short/long-term trajectory and post-MS ambitions'
  },
  program_fit: {
    label: 'Program & Faculty Fit',
    shortLabel: 'Program Fit',
    icon: Building2Icon,
    description: 'Alignment with target curriculum, labs, research groups, and faculty'
  },
  non_technical_strengths: {
    label: 'Non-Technical & Leadership',
    shortLabel: 'Leadership & Soft Skills',
    icon: AwardIcon,
    description: 'Initiative, resilience, teamwork, and cross-functional communication'
  },
  narrative_quality: {
    label: 'Narrative Quality & Flow',
    shortLabel: 'Narrative Flow',
    icon: PenToolIcon,
    description: 'Compelling opening hook, coherent structure, and voice'
  },
  compliance: {
    label: 'Guidelines & Compliance',
    shortLabel: 'Compliance',
    icon: ShieldCheckIcon,
    description: 'Word count adherence, academic formality, and prompt alignment'
  }
};

const SAMPLE_SOP = `Last spring, a query-planning bug I traced at Infosys cut a nightly batch job from four hours to thirty-eight minutes, and left me wanting to understand why the optimizer had failed in the first place. During my undergraduate studies in Computer Science at VIT Vellore, I completed advanced coursework in data structures, operating systems, and distributed databases, graduating with an 8.4 CGPA while leading a four-person capstone project on distributed caching architectures.

After graduating, I joined Infosys as a Systems Engineer on a high-throughput data platform serving 40 million daily queries. Over eighteen months, I owned the migration of three legacy ETL pipelines to Apache Spark, authored the cost model our engineering team now uses to schedule batch jobs, and reduced cluster compute expenditure by 22%. While this production experience deepened my engineering rigor, it also highlighted the limitations of heuristics in query optimization.

I am applying to the Master of Science in Computer Science program at Carnegie Mellon University to transition from using query engines to designing the next generation of autonomous database kernels. I am particularly excited by the work of the Database Group, especially research on learned query optimization and self-driving database architectures under Prof. Andy Pavlo. Coursework such as Advanced Database Systems (15-721) and Distributed Systems (15-440) directly aligns with my goal of developing resilient, adaptive query execution engines for data-intensive applications.`;

function getScoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) {
    return { text: 'text-ink-3', bg: 'bg-canvas', bar: 'bg-ink-3/30', border: 'border-line' };
  }
  if (score >= 8.0) {
    return { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', border: 'border-emerald-200' };
  }
  if (score >= 6.5) {
    return { text: 'text-indigo-700', bg: 'bg-indigo-50', bar: 'bg-indigo-500', border: 'border-indigo-200' };
  }
  if (score >= 5.0) {
    return { text: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500', border: 'border-amber-200' };
  }
  return { text: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-500', border: 'border-rose-200' };
}

function getOverallStatus(score100: number) {
  if (score100 >= 85) {
    return { label: 'Exceptional / Tier-1 Ready', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500/20' };
  }
  if (score100 >= 70) {
    return { label: 'Competitive Draft', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500/20' };
  }
  if (score100 >= 55) {
    return { label: 'Needs Revision', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500/20' };
  }
  return { label: 'Early Draft / High Risk', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-500/20' };
}

export function SopFeedback() {
  const { updateProfile, factors, profile } = useProfile();

  const [sopInput, setSopInput] = useState<string>('');
  const [targetUni, setTargetUni] = useState<string>('Carnegie Mellon University');
  const [targetProgram, setTargetProgram] = useState<string>(
    profile.targetProgram || 'Master of Science in Computer Science'
  );
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [uploadedSops, setUploadedSops] = useState<{ id: string; name: string }[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load uploaded SOP documents from Document Vault
  useEffect(() => {
    async function loadVaultSops() {
      try {
        const allDocs = await api.listDocuments();
        const sops = allDocs.filter(
          (d) => d.kind === 'SOP' || d.name.toLowerCase().includes('sop')
        );
        const mapped = sops.map((d) => ({ id: d.id, name: d.name }));
        setUploadedSops(mapped);
        if (mapped.length > 0 && !sopInput) {
          const first = mapped[0];
          setSelectedDocId(first.id);
          const doc = await api.getDocument(first.id);
          if (doc?.extractedText) {
            setSopInput(doc.extractedText);
          }
        }
      } catch (err) {
        console.warn('Could not load vault SOP documents:', err);
      }
    }
    loadVaultSops();
  }, []);

  const handleSelectUploadedSop = async (docId: string) => {
    setSelectedDocId(docId);
    if (!docId) return;
    const doc = await api.getDocument(docId);
    if (doc?.extractedText) {
      setSopInput(doc.extractedText);
    }
  };

  const handleRunMsAiEvaluation = async () => {
    if (!sopInput || sopInput.trim().length < 50) {
      setEvalError('Please provide at least 50 characters of SOP text to evaluate.');
      return;
    }

    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await api.critiqueSop({
        sopText: sopInput,
        documentId: selectedDocId || undefined,
        university: targetUni,
        program: targetProgram,
        programInformation: `Curriculum and admission criteria for ${targetUni} in ${targetProgram}.`
      });
      setEvaluationResult(res);

      // Synchronize with ML profile score
      const finalScore = res.weighted_score_100 ?? res.overall_score;
      if (finalScore !== undefined && finalScore !== null) {
        updateProfile({ sopQuality: Math.round(finalScore) });
      }
    } catch (err: any) {
      console.error('Failed to run Ms AI SOP critique:', err);
      setEvalError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleFillSample = () => {
    setSopInput(SAMPLE_SOP);
    setTargetUni('Carnegie Mellon University');
    setTargetProgram('Master of Science in Computer Science');
    setEvalError(null);
  };

  const handleCopyReview = () => {
    if (!evaluationResult) return;
    const lines: string[] = [
      `=== Ms AI Statement of Purpose Evaluation ===`,
      `Program: ${evaluationResult.program} at ${evaluationResult.university}`,
      `Composite Score: ${evaluationResult.weighted_score_100 ?? evaluationResult.overall_score}% (${evaluationResult.weighted_score_10 ?? (evaluationResult.overall_score / 10).toFixed(1)}/10)`,
      ``,
      `--- 8-Criteria Breakdown ---`
    ];
    if (evaluationResult.criteria) {
      Object.entries(evaluationResult.criteria).forEach(([k, c]: [string, any]) => {
        const cfg = CRITERIA_CONFIG[k];
        const name = cfg?.label || k;
        lines.push(`• ${name}: ${c.score !== null && c.score !== undefined ? `${c.score}/10` : 'N/A'}`);
        if (c.strength) lines.push(`   Strength: ${c.strength}`);
        if (c.weakness) lines.push(`   Growth: ${c.weakness}`);
      });
    }
    if (evaluationResult.overall_strengths?.length) {
      lines.push(``, `--- Key Strengths ---`);
      evaluationResult.overall_strengths.forEach((s: string) => lines.push(`• ${s}`));
    }
    if (evaluationResult.improvement_suggestions?.length) {
      lines.push(``, `--- Improvement Action Items ---`);
      evaluationResult.improvement_suggestions.forEach((s: string) => lines.push(`• ${s}`));
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = useMemo(() => {
    const trimmed = sopInput.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [sopInput]);
  const charCount = sopInput.length;

  const currentScore = evaluationResult?.weighted_score_100 ?? evaluationResult?.overall_score ?? 0;
  const displayScore = useCountUp(Math.round(currentScore), 0.5);
  const status = getOverallStatus(currentScore);
  const sopFactor = factors.find((f) => f.key === 'sop');

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Left Column: SOP Draft Editor & Parameters */}
      <article className="lg:col-span-5 space-y-5">
        <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
                <SparklesIcon className="h-3 w-3 text-indigo-600" />
                Ms AI
              </span>
              <h3 className="text-[15px] font-semibold text-ink">SOP Draft Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              {!sopInput && (
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="text-[12px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Fill Sample
                </button>
              )}
              {sopInput && (
                <button
                  type="button"
                  onClick={() => setSopInput('')}
                  className="inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink transition-colors"
                >
                  <RotateCcwIcon className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <div>
              <label className="block text-[12px] font-medium text-ink-2">Target University</label>
              <input
                type="text"
                value={targetUni}
                onChange={(e) => setTargetUni(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-[14px] text-ink placeholder:text-ink-3/60 focus:border-indigo-600 focus:outline-none"
                placeholder="e.g. Carnegie Mellon University"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink-2">Target Program</label>
              <input
                type="text"
                value={targetProgram}
                onChange={(e) => setTargetProgram(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-[14px] text-ink placeholder:text-ink-3/60 focus:border-indigo-600 focus:outline-none"
                placeholder="e.g. Master of Science in Computer Science"
              />
            </div>

            {uploadedSops.length > 0 && (
              <div>
                <label className="block text-[12px] font-medium text-ink-2">Load from Document Vault</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => handleSelectUploadedSop(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">-- Select uploaded SOP document --</option>
                  {uploadedSops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-medium text-ink-2">Statement of Purpose Draft</label>
                <span className="text-[11px] font-mono text-ink-3">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
              <textarea
                rows={13}
                value={sopInput}
                onChange={(e) => setSopInput(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line p-3 font-sans text-[13.5px] leading-relaxed text-ink placeholder:text-ink-3/50 focus:border-indigo-600 focus:outline-none"
                placeholder="Paste or write your statement of purpose here (minimum 50 characters)..."
              />
            </div>
          </div>

          {evalError && (
            <div className="mt-3.5 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5 text-[12.5px] text-rose-700">
              <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{evalError}</span>
            </div>
          )}

          <div className="mt-5">
            <Button
              onClick={handleRunMsAiEvaluation}
              disabled={evaluating || sopInput.trim().length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs py-2.5"
            >
              {evaluating ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  Evaluating with Ms AI...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Evaluate with Ms AI
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-[11.5px] text-ink-3">
              Graded on 8 academic criteria calibrated for top global graduate admissions committees.
            </p>
          </div>
        </div>
      </article>

      {/* Right Column: Ms AI Review Panel */}
      <aside className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {evaluating ? (
            /* Active Evaluation Progress State */
            <motion.div
              key="evaluating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-line bg-white p-8 shadow-xs text-center"
            >
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                <SparklesIcon className="h-8 w-8 animate-pulse text-indigo-600" />
                <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-400/30 animate-ping opacity-25" />
              </div>
              <h3 className="mt-5 font-display text-[20px] font-semibold text-ink">
                Ms AI is Evaluating Your SOP
              </h3>
              <p className="mt-2 text-[14px] text-ink-3 max-w-[440px] mx-auto">
                Benchmarking your draft against the 8-Criteria Admissions Rubric for{' '}
                <span className="font-medium text-ink">{targetProgram}</span> at{' '}
                <span className="font-medium text-ink">{targetUni}</span>...
              </p>

              <div className="mt-7 w-full max-w-[380px] mx-auto space-y-2.5 text-left">
                <div className="flex items-center gap-3 rounded-lg border border-line/80 bg-canvas/40 px-3.5 py-2.5 text-[13px]">
                  <Loader2Icon className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                  <span className="text-ink font-medium">Analyzing academic preparation & technical evidence</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-line/80 bg-canvas/40 px-3.5 py-2.5 text-[13px]">
                  <Loader2Icon className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                  <span className="text-ink font-medium">Benchmarking university fit & research alignment</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-line/80 bg-canvas/40 px-3.5 py-2.5 text-[13px]">
                  <Loader2Icon className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                  <span className="text-ink font-medium">Scoring criteria & synthesizing action items</span>
                </div>
              </div>
            </motion.div>
          ) : evaluationResult ? (
            /* Evaluation Results View */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Score Header Card */}
              <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
                        <SparklesIcon className="h-3 w-3 text-indigo-600" />
                        Ms AI Review
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[17px] font-semibold text-ink">
                      {evaluationResult.program}
                    </h3>
                    <p className="text-[13px] text-ink-3">
                      {evaluationResult.university}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="font-mono text-[44px] font-bold leading-none tracking-tight text-ink">
                        {displayScore}
                      </span>
                      <span className="text-[16px] font-medium text-ink-3">/ 100</span>
                    </div>
                    <p className="mt-1 text-[12.5px] font-medium text-indigo-600">
                      Weighted: {evaluationResult.weighted_score_10 ?? (evaluationResult.weighted_score_100 / 10).toFixed(1)} / 10
                    </p>
                  </div>
                </div>

                {sopFactor && (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-canvas/60 px-4 py-2.5 text-[13px]">
                    <span className="text-ink-2">Contribution to Competitiveness Score:</span>
                    <span className="font-mono font-semibold text-accent">
                      {formatSigned(sopFactor.contribution)} pts
                    </span>
                  </div>
                )}

                {evaluationResult.summary && (
                  <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wider text-indigo-900">
                      Admissions Officer Executive Summary
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-indigo-950">
                      {evaluationResult.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* 8-Criteria Rubric Grid */}
              <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div>
                    <h4 className="text-[15px] font-semibold text-ink">8-Criteria Rubric Breakdown</h4>
                    <p className="text-[12px] text-ink-3">Multi-dimensional analysis calibrated against global admission standards</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReview}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-white hover:text-ink"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span>Copy Report</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                  {Object.entries(evaluationResult.criteria || {}).map(([key, crit]: [string, any]) => {
                    const cfg = CRITERIA_CONFIG[key] || {
                      label: key.replace(/_/g, ' '),
                      shortLabel: key,
                      icon: FileTextIcon,
                      description: ''
                    };
                    const Icon = cfg.icon;
                    const scoreVal = crit.score !== null && crit.score !== undefined ? Number(crit.score) : null;
                    const colors = getScoreColor(scoreVal);

                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-line p-3.5 bg-canvas/30 hover:bg-canvas/60 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-line text-ink-2">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[13px] font-semibold text-ink truncate" title={cfg.label}>
                              {cfg.label}
                            </span>
                          </div>
                          <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {scoreVal !== null ? `${scoreVal}/10` : 'N/A'}
                          </span>
                        </div>

                        {scoreVal !== null && (
                          <div className="mt-2.5 h-1.5 w-full rounded-full bg-line overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                              style={{ width: `${Math.min(100, Math.max(0, scoreVal * 10))}%` }}
                            />
                          </div>
                        )}

                        {crit.strength && (
                          <div className="mt-2.5 text-[12px] leading-snug">
                            <span className="font-semibold text-emerald-700">Strength: </span>
                            <span className="text-ink-2">{crit.strength}</span>
                          </div>
                        )}

                        {crit.weakness && (
                          <div className="mt-1.5 text-[12px] leading-snug">
                            <span className="font-semibold text-amber-700">Growth: </span>
                            <span className="text-ink-3">{crit.weakness}</span>
                          </div>
                        )}

                        {crit.evidence && (
                          <div className="mt-2 rounded border-l-2 border-indigo-400 bg-white/80 px-2 py-1 text-[11px] italic text-ink-3 line-clamp-2">
                            &ldquo;{crit.evidence}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Key Strengths */}
                {evaluationResult.overall_strengths?.length > 0 && (
                  <div className="mt-6 border-t border-line pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2Icon className="h-4 w-4 text-emerald-600" />
                      <h5 className="text-[14px] font-semibold text-ink">Key Strengths</h5>
                    </div>
                    <ul className="space-y-2">
                      {evaluationResult.overall_strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-ink-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Action Items */}
                {evaluationResult.improvement_suggestions?.length > 0 && (
                  <div className="mt-5 border-t border-line pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircleIcon className="h-4 w-4 text-amber-600" />
                      <h5 className="text-[14px] font-semibold text-ink">Improvement Action Items</h5>
                    </div>
                    <ul className="space-y-2">
                      {evaluationResult.improvement_suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-ink-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Ready State / Explanatory Preview */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-line bg-white p-8 shadow-xs text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                <SparklesIcon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-[20px] font-semibold text-ink">
                Ms AI Admissions Evaluation
              </h3>
              <p className="mx-auto mt-2 max-w-[460px] text-[14px] text-ink-3 leading-relaxed">
                Paste or load your draft Statement of Purpose on the left, then click{' '}
                <strong className="text-ink font-semibold">Evaluate with Ms AI</strong> to receive an in-depth admissions review across 8 dimensions.
              </p>

              {/* 8 Criteria Overview Preview */}
              <div className="mt-6 text-left">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-3 mb-3 text-center">
                  Evaluated Across 8 Academic Dimensions
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {Object.entries(CRITERIA_CONFIG).map(([k, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <div key={k} className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-canvas/40 p-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-line text-indigo-600">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-ink truncate">{cfg.label}</p>
                          <p className="text-[11px] text-ink-3 truncate">{cfg.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!sopInput.trim() && (
                <div className="mt-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFillSample}
                  >
                    Load Sample SOP Draft
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}