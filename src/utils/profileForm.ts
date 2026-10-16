import { InstitutionTier, Profile, ProfileForm } from '../types/profile';

export function toForm(p: Profile): ProfileForm {
  return {
    undergrad: p.undergrad || '',
    degree: p.degree || '',
    institutionTier: String(p.institutionTier || 3),
    targetProgram: p.targetProgram || 'MS Computer Science',
    intake: p.intake || 'Fall 2027',
    gpa: p.gpa > 0 ? String(p.gpa) : '',
    gre: p.gre > 0 ? String(p.gre) : '',
    toefl: p.toefl > 0 ? String(p.toefl) : '',
    publications: p.publications > 0 ? String(p.publications) : '',
    workMonths: p.workMonths > 0 ? String(p.workMonths) : '',
    internships: p.internships > 0 ? String(p.internships) : ''
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
    institutionTier: (Number(f.institutionTier) || 3) as InstitutionTier,
    targetProgram: f.targetProgram,
    intake: f.intake,
    gpa: num(f.gpa, 0),
    gre: num(f.gre, 0),
    toefl: num(f.toefl, 0),
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
    if (!f.gpa.trim() || !inRange(f.gpa, 1, 10)) errors.gpa = 'Enter your GPA (between 1.0 and 10.0).';
  }
  if (step === 1) {
    if (!f.gre.trim() || !inRange(f.gre, 260, 340)) errors.gre = 'GRE total must be between 260 and 340.';
    if (!f.toefl.trim() || !inRange(f.toefl, 0, 120)) errors.toefl = 'TOEFL must be between 0 and 120.';
  }
  return errors;
}