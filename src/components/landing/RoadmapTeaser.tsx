import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from './Reveal';
import { initialProfile } from '../../data/profile';
import { roadmapItems, roadmapMonths } from '../../data/roadmap';
import { applyLever, computeScore } from '../../utils/scoring';
import { Profile } from '../../types/profile';

const W = 1000;
const H = 220;
const PAD_X = 40;

export function RoadmapTeaser() {
  const reduce = useReducedMotion();
  const chosen = ['r2', 'r1', 'r4', 'r3'].map((id) => roadmapItems.find((r) => r.id === id)).filter((r): r is NonNullable<typeof r> => !!r);

  let p: Profile = initialProfile;
  const points = [{ month: 0, score: computeScore(p), label: 'Today' }];
  chosen.forEach((item) => {
    if (item.lever) p = applyLever(p, item.lever);
    points.push({ month: item.start + item.span, score: computeScore(p), label: item.title.split(',')[0] });
  });

  const x = (m: number) => PAD_X + m / 11 * (W - PAD_X * 2);
  const y = (s: number) => H - 30 - (s - 60) / 30 * (H - 60);
  let d = `M ${x(points[0].month)} ${y(points[0].score)}`;
  points.slice(1).forEach((pt) => {
    d += ` H ${x(pt.month)} V ${y(pt.score)}`;
  });
  d += ` H ${x(11)}`;

  return (
    <section id="roadmap" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[56px]">A plan measured in points.</h2>
          </Reveal>
          <Reveal delay={0.05} className="lg:col-span-5 lg:pt-3">
            <p className="text-[16px] leading-[1.7] text-ink-2">
              Your roadmap orders every action by how much it moves your score, and when it has to happen to land before deadlines. Here, four actions take a {points[0].score} to a {points[points.length - 1].score}.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <div className="rounded-lg border border-line bg-white p-6 md:p-8">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Projected score rising from ${points[0].score} to ${points[points.length - 1].score} over twelve months`}>
              {[60, 70, 80, 90].map((s) =>
              <g key={s}>
                  <line x1={PAD_X} x2={W - PAD_X} y1={y(s)} y2={y(s)} stroke="#EDEDE8" strokeWidth={1} />
                  <text x={0} y={y(s) + 4} className="fill-ink-3 font-mono" fontSize={11}>
                    {s}
                  </text>
                </g>
              )}
              <motion.path
                d={d}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth={2}
                initial={{ pathLength: reduce ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: reduce ? 0 : 1.2, ease: [0.65, 0, 0.35, 1] }} />
              
              {points.map((pt, i) =>
              <g key={`${pt.month}-${i}`}>
                  <circle cx={x(pt.month)} cy={y(pt.score)} r={4} fill="#fff" stroke="#1D4ED8" strokeWidth={2} />
                  <text x={x(pt.month) + 8} y={y(pt.score) - 10} fontSize={12} className="fill-ink font-mono">
                    {pt.score}
                  </text>
                </g>
              )}
            </svg>
            <div className="mt-2 grid grid-cols-12 border-t border-line pt-3" style={{ paddingLeft: `${PAD_X / W * 100}%`, paddingRight: `${PAD_X / W * 100}%` }}>
              {roadmapMonths.map((m) =>
              <span key={m} className="font-mono text-[11px] text-ink-3">
                  {m}
                </span>
              )}
            </div>
            <ol className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {chosen.map((item, i) =>
              <li key={item.id}>
                  <p className="font-mono text-[12px] text-accent">
                    +{points[i + 1].score - points[i].score} pts · by {roadmapMonths[Math.min(item.start + item.span, 11)]}
                  </p>
                  <p className="mt-1 text-[14px] font-medium leading-snug">{item.title}</p>
                </li>
              )}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>);

}