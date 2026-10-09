import React from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { MatchingSection } from '../components/landing/MatchingSection';
import { RoadmapTeaser } from '../components/landing/RoadmapTeaser';
import { CtaSection } from '../components/landing/CtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export function Landing() {
  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <MatchingSection />
        <RoadmapTeaser />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>);

}