import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { WhatIfSimulator } from '../components/roadmap/WhatIfSimulator';
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline';
import { useProfile } from '../contexts/ProfileContext';
import { applyLever } from '../utils/scoring';
import { Profile } from '../types/profile';

export function Roadmap() {
  const { profile } = useProfile();
  const [sim, setSim] = useState<Profile>(profile);

  useEffect(() => {
    setSim(profile);
  }, [profile]);

  const simulate = (lever: Partial<Profile>) => {
    setSim((s) => applyLever(s, lever));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-16">
      <PageHeader
        title="Roadmap"
        description="Actions ranked by how many points they add and when they must happen to land before deadlines. Use the simulator to see how each one moves your tiers." />
      
      <WhatIfSimulator base={profile} sim={sim} onChange={(patch) => setSim((s) => ({ ...s, ...patch }))} onReset={() => setSim(profile)} />
      <RoadmapTimeline base={profile} onSimulate={simulate} />
    </div>);

}