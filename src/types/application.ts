import { Tier, FitReason } from './university';

export type Stage = 'shortlisted' | 'preparing' | 'submitted' | 'decision';
export type DocStatus = 'missing' | 'draft' | 'final';
export type DocKey = 'sop' | 'lor1' | 'lor2' | 'lor3' | 'transcript' | 'resume';

export interface Application {
  id: string;
  universityId: string;
  stage: Stage;
  deadline: string;
  docs: Record<DocKey, DocStatus>;
  fee: number;
  note: string;
  universityName?: string;
  program?: string;
  country?: string;
  tier?: Tier;
  fitScore?: number;
  reasons?: FitReason[];
}