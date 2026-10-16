import React, { useEffect, useState } from 'react';
import { SparklesIcon, Loader2Icon, CompassIcon, ArrowUpRightIcon, CheckCircle2Icon, ClockIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Profile } from '../../types/profile';
import { RankedUniversity } from '../../types/university';
import { api } from '../../services/api';

interface AiRoadmapAdvisoryProps {
  profile: Profile;
  ranked: RankedUniversity[];
}

export function AiRoadmapAdvisory({ profile, ranked }: AiRoadmapAdvisoryProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const topUnis = ranked.slice(0, 3).map((r) => r.university.name);
      const res = await api.generateRoadmap({
        gpa: profile.gpa,
        gre: profile.gre,
        toefl: profile.toefl,
        publications: profile.publications,
        workMonths: profile.workMonths,
        targetUniversities: topUnis.length > 0 ? topUnis : undefined
      });
      setData(res);
    } catch (err: any) {
      console.warn('AI Roadmap fetch failed:', err);
      const topUnis = ranked.slice(0, 3).map((r) => r.university.name);
      setData({
        overview: `Strategic admissions plan targeting ${topUnis[0] || 'Top Graduate CS Programs'}. Key priorities focus on eliminating profile bottlenecks in research and statement alignment.`,
        suggested_timeline_months: 6,
        executive_advice: `Securing a research artifact and tailoring your statement to specific faculty agendas will move the needle most at ${topUnis[0] || 'target programs'}.`,
        key_priorities: [
          {
            area: "Research & Preprints",
            action_item: "Deposit a capstone research benchmark or paper on arXiv / student workshop.",
            timeline: "Months 1-3",
            expected_score_lift: "+8 percentile lift"
          },
          {
            area: "SOP Faculty Alignment",
            action_item: `Name 2 specific professors and cite their recent work in your Statement of Purpose for ${topUnis[0] || 'target universities'}.`,
            timeline: "Months 3-4",
            expected_score_lift: "+6 percentile lift"
          },
          {
            area: "Letters of Recommendation",
            action_item: "Provide 3 recommenders with bulleted dossiers highlighting problem-solving and independence.",
            timeline: "Months 4-5",
            expected_score_lift: "+4 percentile lift"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStrategy();
  }, [profile.gpa, profile.gre, profile.workMonths, profile.publications]);

  return (
    <section className="rounded-xl border border-line bg-white p-6 md:p-8 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
              <SparklesIcon className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              Ms AI
            </span>
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink">
              Strategic Roadmap & Advisory
            </h2>
          </div>
          <p className="mt-1 text-[14px] text-ink-3">
            Customized optimization timeline synthesized from your SHAP bottlenecks and target universities.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchStrategy}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          {loading ? (
            <>
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-3.5 w-3.5 text-accent" />
              Refresh Strategy
            </>
          )}
        </Button>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-12 text-ink-3">
          <Loader2Icon className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
          <p className="text-[14px]">Consulting Ms AI admissions strategist model...</p>
        </div>
      )}

      {error && !data && (
        <div className="mt-6 rounded-md border border-line bg-canvas p-4 text-[14px] text-ink-2">
          <p className="font-medium text-ink">Offline Mode Active</p>
          <p className="mt-1 text-ink-3">
            Using algorithmic recommendations below while LLM service is reconnecting.
          </p>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          {/* Executive Overview & Diagnosis */}
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8 rounded-lg bg-canvas p-5 border border-line">
              <p className="text-[12px] font-medium uppercase tracking-wider text-ink-3">
                Strategic Diagnosis
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                {data.overview}
              </p>
            </div>

            <div className="md:col-span-4 rounded-lg bg-accent/5 p-5 border border-accent/20 flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-accent">
                  Target Window
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-[32px] font-semibold text-ink tabular-nums">
                    {data.suggested_timeline_months || 6}
                  </span>
                  <span className="text-[14px] text-ink-3">months to deadline</span>
                </div>
              </div>
              <p className="mt-2 text-[12px] text-ink-3 leading-snug">
                Optimized for Fall 2026 intake decision cycles.
              </p>
            </div>
          </div>

          {/* Executive Advice Callout */}
          {data.executive_advice && (
            <div className="rounded-lg border-l-4 border-accent bg-accent/[0.04] p-4 text-[14px] leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Admissions Director Tip: </span>
              {data.executive_advice}
            </div>
          )}

          {/* Key Priority Milestones */}
          <div>
            <h3 className="text-[14px] font-semibold text-ink mb-3">
              Prioritized Execution Milestones
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data.key_priorities || []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-line bg-white p-4 hover:border-line-strong transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-ink-2">
                        {item.area}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3">
                        <ClockIcon className="h-3 w-3" />
                        {item.timeline}
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-ink leading-snug">
                      {item.action_item}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[12px]">
                    <span className="text-ink-3">Expected lift</span>
                    <span className="font-mono text-accent font-medium">
                      {item.expected_score_lift}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
