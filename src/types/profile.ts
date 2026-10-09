export type InstitutionTier = 1 | 2 | 3;

export interface Profile {
  name: string;
  email: string;
  undergrad: string;
  degree: string;
  institutionTier: InstitutionTier;
  targetProgram: string;
  intake: string;
  gpa: number;
  gre: number;
  toefl: number;
  publications: number;
  workMonths: number;
  internships: number;
  lorStrength: number;
  sopQuality: number;
}

export interface ProfileForm {
  undergrad: string;
  degree: string;
  institutionTier: string;
  targetProgram: string;
  intake: string;
  gpa: string;
  gre: string;
  toefl: string;
  publications: string;
  workMonths: string;
  internships: string;
}

export type FactorKey =
'gpa' |
'gre' |
'toefl' |
'research' |
'work' |
'internships' |
'lor' |
'sop' |
'institution';

export interface ShapFactor {
  key: FactorKey;
  label: string;
  value: string;
  contribution: number;
  explanation: string;
}