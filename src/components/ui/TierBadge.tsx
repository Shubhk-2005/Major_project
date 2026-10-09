import React from 'react';
import { Tier } from '../../types/university';
import { tierLabel, tierSoft, tierText } from '../../utils/tiers';

export function TierBadge({ tier, fit }: {tier: Tier;fit?: number;}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-0.5 text-[12px] font-medium ${tierSoft[tier]} ${tierText[tier]}`}>
      
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {tierLabel[tier]}
      {fit !== undefined && <span className="font-mono tabular-nums">{fit}</span>}
    </span>);

}