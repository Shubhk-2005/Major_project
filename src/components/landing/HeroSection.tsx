import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { LiveScoreCard } from './LiveScoreCard';

export function HeroSection() {
  const reduce = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 220, damping: 30, delay }
  });

  return (
    <section className="mx-auto grid max-w-[1200px] gap-16 px-6 pb-24 pt-16 md:px-10 md:pt-24 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-32">
      <div className="lg:col-span-7">
        <motion.h1
          {...enter(0)}
          className="font-display text-[52px] font-semibold leading-[0.95] tracking-[-0.05em] text-ink md:text-[80px] lg:text-[92px]">
          
          Know where you stand.
          <br />
          <span className="text-ink-3">And exactly why.</span>
        </motion.h1>
        <motion.p {...enter(0.06)} className="mt-8 max-w-[520px] text-[17px] leading-[1.6] text-ink-2">
          MsAdmit scores your graduate application against real admit outcomes, explains every point of it, and tells you what to change in the next six to twelve months.
        </motion.p>
        <motion.div {...enter(0.12)} className="mt-10 flex flex-wrap items-center gap-3">
          <Button to="/signup" size="lg">
            Get your score
          </Button>
          <a
            href="#how"
            className="inline-flex h-12 items-center gap-2 rounded px-4 text-[15px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink">
            
            How scoring works
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </a>
        </motion.div>
        <motion.p {...enter(0.18)} className="mt-12 font-mono text-[12px] text-ink-3">
          Benchmarked against the Top 150 QS World Universities for Computer Science
        </motion.p>
      </div>
      <motion.div {...enter(0.1)} className="lg:col-span-5">
        <LiveScoreCard />
      </motion.div>
    </section>);

}