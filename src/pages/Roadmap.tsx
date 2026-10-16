import React, { useEffect, useState } from 'react';
import { SparklesIcon, CalendarIcon, LayoutListIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { WhatIfSimulator } from '../components/roadmap/WhatIfSimulator';
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline';
import { AiRoadmapAdvisory } from '../components/roadmap/AiRoadmapAdvisory';
import { useProfile } from '../contexts/ProfileContext';
import { applyLever } from '../utils/scoring';
import { Profile } from '../types/profile';

export function Roadmap() {
  const { profile, score, ranked } = useProfile();
  const [sim, setSim] = useState<Profile>(profile);
  const [activeTab, setActiveTab] = useState<'advisory' | 'timeline' | 'both'>('advisory');

  useEffect(() => {
    setSim(profile);
  }, [profile]);

  const simulate = (lever: Partial<Profile>) => {
    setSim((s) => applyLever(s, lever));
    const simEl = document.getElementById('whatif-hero');
    if (simEl) {
      simEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="What If ??"
        description="Simulate profile levers in real time to see your score lift, and follow Ms AI's prioritized strategic roadmap before admission deadlines."
      />

      {/* Hero Tool: What-If Interactive Simulator placed front-and-center */}
      <section id="whatif-hero" aria-label="What If Simulator Hero">
        <WhatIfSimulator
          base={profile}
          sim={sim}
          currentScore={score}
          onChange={(patch) => setSim((s) => ({ ...s, ...patch }))}
          onReset={() => setSim(profile)}
        />
      </section>

      {/* Strategic Guidance & Timeline Section with Segmented View Switcher */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
              Strategic Guidance & Timeline
            </h2>
            <p className="mt-1 text-[14px] text-ink-3">
              Actionable advice tailored to your target universities and deadlines.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-line bg-stone-100/80 p-1 text-[13px] font-medium text-ink-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition-all ${
                activeTab === 'advisory'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'hover:text-ink text-ink-3'
              }`}
            >
              <SparklesIcon className="h-3.5 w-3.5 text-accent" />
              Ms AI Advisory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'hover:text-ink text-ink-3'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-ink-3" />
              12-Month Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition-all ${
                activeTab === 'both'
                  ? 'bg-white text-ink shadow-2xs font-semibold'
                  : 'hover:text-ink text-ink-3'
              }`}
            >
              <LayoutListIcon className="h-3.5 w-3.5 text-ink-3" />
              Show Both
            </button>
          </div>
        </div>

        {(activeTab === 'advisory' || activeTab === 'both') && (
          <AiRoadmapAdvisory profile={profile} ranked={ranked} />
        )}

        {(activeTab === 'timeline' || activeTab === 'both') && (
          <RoadmapTimeline base={profile} onSimulate={simulate} />
        )}
      </section>
    </div>
  );
}