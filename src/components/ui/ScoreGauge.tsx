import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScoreGaugeProps {
  value: number;
  size?: number;
  stroke?: number;
  showTicks?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ScoreGauge({ value, size = 240, stroke = 10, showTicks = true, children, className = '' }: ScoreGaugeProps) {
  const reduce = useReducedMotion();
  const c = size / 2;
  const r = c - stroke / 2 - 2;
  const track = arcPath(c, c, r, -135, 135);
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {showTicks &&
        ticks.map((t) => {
          const deg = -135 + t * 2.7;
          const a = polar(c, c, r - stroke - 6, deg);
          const b = polar(c, c, r - stroke - (t % 50 === 0 ? 14 : 10), deg);
          return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#D4D4CE" strokeWidth={1} />;
        })}
        <path d={track} fill="none" stroke="#EDEDE8" strokeWidth={stroke} strokeLinecap="round" />
        <motion.path
          d={track}
          fill="none"
          stroke="#1D4ED8"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? value / 100 : 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.23, 1, 0.32, 1] }} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>);

}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = deg * Math.PI / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}