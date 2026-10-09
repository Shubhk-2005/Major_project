import { Tier } from '../types/university';

export const tierOrder: Tier[] = ['target', 'consider', 'reach'];

export const tierLabel: Record<Tier, string> = {
  target: 'Target',
  consider: 'Consider',
  reach: 'Reach'
};

export const tierText: Record<Tier, string> = {
  target: 'text-target',
  consider: 'text-consider',
  reach: 'text-reach'
};

export const tierSoft: Record<Tier, string> = {
  target: 'bg-target-soft',
  consider: 'bg-consider-soft',
  reach: 'bg-reach-soft'
};

export const tierSolid: Record<Tier, string> = {
  target: 'bg-target',
  consider: 'bg-consider',
  reach: 'bg-reach'
};

export const tierDefinition: Record<Tier, string> = {
  target: 'Fit 60+. Your profile meets or beats typical admits.',
  consider: 'Fit 40–59. Competitive, with specific gaps to close.',
  reach: 'Fit under 40. Admits here usually bring a stronger profile.'
};