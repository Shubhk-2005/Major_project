import React from 'react';
import { Tier } from '../../types/university';
import { tierLabel, tierSoft, tierText } from '../../utils/tiers';

export function TierBadge({
  tier,
  fit,
  showFit = true,
}: {
  tier: Tier;
  fit?: number;
  showFit?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-0.5 text-[12px] font-medium ${tierSoft[tier]} ${tierText[tier]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      <span>{tierLabel[tier]}</span>
      {fit !== undefined && showFit && (
        <span className="font-mono text-[11px] opacity-80 tabular-nums font-semibold">
          ({fit}% Fit)
        </span>
      )}
    </span>
  );
}