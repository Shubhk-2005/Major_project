import React from 'react';
import { Reveal } from './Reveal';
import { DashboardPreview } from './DashboardPreview';

const steps = [
{ title: 'Upload your profile', body: 'Transcripts, test scores, resume, SOP and LORs. Takes about ten minutes; documents are parsed, not just stored.' },
{ title: 'Read the explanation', body: 'Your score is decomposed factor by factor, in points, so you can see exactly what is helping and what is costing you.' },
{ title: 'Act on the plan', body: 'A dated roadmap ranks the changes by impact, and the simulator shows how each one moves your university tiers.' }];


export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <h2 className="max-w-[720px] font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[56px]">
            From documents to decisions in three steps.
          </h2>
        </Reveal>
        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-12">
          {steps.map((s, i) =>
          <Reveal key={s.title} delay={i * 0.05}>
              <li className="border-t border-ink pt-5">
                <span className="font-mono text-[13px] text-ink-3">{i + 1}</span>
                <h3 className="mt-3 font-display text-[20px] font-medium tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.65] text-ink-2">{s.body}</p>
              </li>
            </Reveal>
          )}
        </ol>
        <Reveal className="mt-20">
          <DashboardPreview />
        </Reveal>
      </div>
    </section>);

}