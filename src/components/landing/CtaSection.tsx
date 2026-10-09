import React from 'react';
import { Reveal } from './Reveal';
import { Button } from '../ui/Button';

export function CtaSection() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-24 md:px-10 md:py-32 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <h2 className="max-w-[760px] font-display text-[48px] font-semibold leading-[0.98] tracking-[-0.045em] md:text-[80px]">
            Your score is ten minutes away.
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="flex flex-col items-start gap-3">
            <Button to="/signup" size="lg">
              Get your score
            </Button>
            <p className="text-[13px] text-ink-3">Free for your first profile. No card required.</p>
          </div>
        </Reveal>
      </div>
    </section>);

}