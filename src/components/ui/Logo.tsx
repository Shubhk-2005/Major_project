import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/' }: {to?: string;}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      aria-label="MsAdmit home">
      
      <span aria-hidden className="relative h-5 w-5 rounded-sm bg-ink">
        <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-canvas" />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">MsAdmit</span>
    </Link>);

}