import { InstitutionTier, Profile, ProfileForm } from '../types/profile';

export function toForm(p: Profile): ProfileForm {
  return {
    undergrad: p.undergrad,
    degree: p.degree,
    institutionTier: String(p.institutionTier),
    targetProgram: p.targetProgram,
    intake: p.intake,
    gpa: String(p.gpa),
    gre: String(p.gre),
    toefl: String(p.toefl),
    publications: String(p.publications),
    workMonths: String(p.workMonths),
    internships: String(p.internships)
  };
}

export function fromForm(f: ProfileForm, base: Profile): Profile {
  const num = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) && v.trim() !== '' ? n : fallback;
  };
  return {
    ...base,
    undergrad: f.undergrad.trim(),
    degree: f.degree.trim(),
    institutionTier: Number(f.institutionTier) as InstitutionTier,
    targetProgram: f.targetProgram,
    intake: f.intake,
    gpa: num(f.gpa, base.gpa),
    gre: num(f.gre, base.gre),
    toefl: num(f.toefl, base.toefl),
    publications: num(f.publications, 0),
    workMonths: num(f.workMonths, 0),
    internships: num(f.internships, 0)
  };
}

export type FormErrors = Partial<Record<keyof ProfileForm, string>>;

export function validateStep(step: number, f: ProfileForm): FormErrors {
  const errors: FormErrors = {};
  const inRange = (v: string, min: number, max: number) => {
    const n = Number(v);
    return v.trim() !== '' && Number.isFinite(n) && n >= min && n <= max;
  };
  if (step === 0) {
    if (!f.undergrad.trim()) errors.undergrad = 'Enter your undergraduate institution.';
    if (!f.degree.trim()) errors.degree = 'Enter your degree and major.';
    if (!inRange(f.gpa, 0, 10)) errors.gpa = 'GPA must be between 0 and 10.';
    if (!inRange(f.workMonths, 0, 240)) errors.workMonths = 'Enter months of full-time work (0 if none).';
    if (!inRange(f.internships, 0, 20)) errors.internships = 'Enter a number, 0 if none.';
    if (!inRange(f.publications, 0, 20)) errors.publications = 'Enter a number, 0 if none.';
  }
  if (step === 1) {
    if (!inRange(f.gre, 260, 340)) errors.gre = 'GRE total must be between 260 and 340.';
    if (!inRange(f.toefl, 0, 120)) errors.toefl = 'TOEFL must be between 0 and 120.';
  }
  return errors;
}