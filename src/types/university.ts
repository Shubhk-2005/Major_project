export type Tier = 'target' | 'consider' | 'reach';
export type Course = 'Computer Science' | 'Data Science' | 'Artificial Intelligence';
export type ResearchWeight = 'high' | 'medium' | 'low';

export interface University {
  id: string;
  name: string;
  program: string;
  course: Course;
  country: string;
  city: string;
  rank: number;
  acceptance: number;
  avgGre: number;
  avgGpa: number;
  avgToefl: number;
  tuition: number;
  living: number;
  deadline: string;
  bar: number;
  researchWeight: ResearchWeight;
}

export interface FitReason {
  key: string;
  label: string;
  impact: number;
  text: string;
}

export interface FitResult {
  fit: number;
  tier: Tier;
  reasons: FitReason[];
}

export interface RankedUniversity {
  university: University;
  fit: FitResult;
}

export interface Outcome {
  id: string;
  universityId: string;
  gpa: number;
  gre: number;
  publications: number;
  workMonths: number;
  result: 'admit' | 'reject';
  cycle: string;
}